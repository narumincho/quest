import * as d from "../../data";
import { useState } from "react";

export type QuestionTree = {
  id: d.QQuestionId;
  text: string;
  children: ReadonlyArray<QuestionTree>;
};

export type UseQuestionMapResult = {
  /** 質問をすべて置き換える (storybook 用) */
  readonly overwriteQuestionList: (
    questionList: ReadonlyArray<d.QQuestion>
  ) => void;
  /** 質問をリロードするまで保存する */
  readonly setQuestion: (question: d.QQuestion) => void;
  /** 複数の質問を一度にリロードするまで保存する */
  readonly setQuestionList: (questionList: ReadonlyArray<d.QQuestion>) => void;
  /** QuestionId から 質問を得る */
  readonly questionById: (id: d.QQuestionId) => d.QQuestion | undefined;
  /** 質問の子を取得する */
  readonly questionChildren: (
    id: d.QQuestionId
  ) => ReadonlyArray<d.QQuestionId>;
  readonly getParentQuestionList: (
    id: d.QQuestionId
  ) => ReadonlyArray<d.QQuestion>;
  readonly questionTree: (id: d.QProgramId) => ReadonlyArray<QuestionTree>;
  /** ログアウトしたとき, キャッシュを削除する */
  readonly deleteAll: () => void;
  /** プログラムに属して, かつ 質問の子孫でなない質問をキャッシュから取得する */
  readonly getQuestionListInProgramAndNotChildren: (
    programId: d.QProgramId,
    questionId: d.QQuestionId
  ) => ReadonlyArray<d.QQuestion>;
};

export const useQuestionMap = (): UseQuestionMapResult => {
  const [questionMap, setQuestionMap] = useState<
    ReadonlyMap<d.QQuestionId, d.QQuestion>
  >(new Map());
  return {
    /** 質問をすべて置き換える (storybook 用) */
    overwriteQuestionList: (questionList: ReadonlyArray<d.QQuestion>): void => {
      setQuestionMap(
        new Map(
          questionList.map((question) => [question.id, question] as const)
        )
      );
    },
    /** 質問をリロードするまで保存する */
    setQuestion: (question: d.QQuestion): void => {
      setQuestionMap((before) => {
        return new Map(before).set(question.id, question);
      });
    },
    /** 複数の質問を一度にリロードするまで保存する */
    setQuestionList: (questionList: ReadonlyArray<d.QQuestion>): void => {
      setQuestionMap((before) => {
        const map = new Map(before);
        for (const question of questionList) {
          map.set(question.id, question);
        }
        return map;
      });
    },
    /** QuestionId から 質問を得る */
    questionById: (id: d.QQuestionId) => {
      return questionMap.get(id);
    },
    questionChildren: (id: d.QQuestionId): ReadonlyArray<d.QQuestionId> =>
      questionChildren(id, questionMap),
    getParentQuestionList: (id: d.QQuestionId): ReadonlyArray<d.QQuestion> =>
      getParentQuestionList(id, questionMap),
    questionTree: (programId): ReadonlyArray<QuestionTree> =>
      getQuestionTree(programId, [...questionMap.values()]),
    deleteAll: () => {
      setQuestionMap(new Map());
    },
    getQuestionListInProgramAndNotChildren: (programId, questionId) => {
      const result: Array<d.QQuestion> = [];
      for (const question of questionMap.values()) {
        if (
          question.programId === programId &&
          !isChildren(question.id, questionId, questionMap)
        ) {
          result.push(question);
        }
      }
      return result;
    },
  };
};

/**
 * 質問の直接な子供を取得する
 */
export const questionChildren = (
  id: d.QQuestionId,
  questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>
): ReadonlyArray<d.QQuestionId> => {
  const result: Array<d.QQuestionId> = [];
  for (const question of questionMap.values()) {
    if (question.parent._ === "Just" && question.parent.value === id) {
      result.push(question.id);
    }
  }
  return result;
};

export const getParentQuestionList = (
  id: d.QQuestionId,
  questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>
): ReadonlyArray<d.QQuestion> => {
  let targetId = id;
  const result: Array<d.QQuestion> = [];
  while (true) {
    const question = questionMap.get(targetId);
    if (question === undefined) {
      return result;
    }
    result.push(question);
    if (question.parent._ === "Nothing") {
      return result;
    }
    targetId = question.parent.value;
  }
};

/**
 * 質問が, 指定した質問の子供になっているか.
 * 直接的でなくても, 孫や, ひ孫などなら `true` を返す.
 * 質問が見つからなかったときは, `false` を返す
 * `maybeChildrenQuestionId` と `maybeParentQuestionId` が同じものを指定されたら, `true` を返す
 *
 * @param maybeChildrenQuestionId 子孫かもしれない質問ID
 * @param maybeParentQuestionId 親かも知れない質問ID
 * @param questionMap すべての質問が含まれたMap
 */
const isChildren = (
  maybeChildrenQuestionId: d.QQuestionId,
  maybeParentQuestionId: d.QQuestionId,
  questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>
) => {
  if (maybeChildrenQuestionId === maybeParentQuestionId) {
    return true;
  }
  let targetId = maybeChildrenQuestionId;
  while (true) {
    const question = questionMap.get(targetId);
    if (question === undefined) {
      return false;
    }
    if (question.parent._ === "Nothing") {
      return false;
    }
    if (question.parent.value === maybeParentQuestionId) {
      return true;
    }
    targetId = question.parent.value;
  }
};

/**
 * プログラム全体の質問の木構造をつくる
 * @param programId プログラムID
 * @param questionList すべての質問が含まれているリスト
 */
export const getQuestionTree = (
  programId: d.QProgramId,
  questionList: ReadonlyArray<d.QQuestion>
): ReadonlyArray<QuestionTree> => {
  const treeList: Array<QuestionTree> = [];
  for (const question of questionList) {
    if (question.programId === programId && question.parent._ === "Nothing") {
      treeList.push({
        id: question.id,
        text: question.name,
        children: getQuestionChildrenTree(question.id, questionList),
      });
    }
  }
  return treeList;
};

/**
 * 質問の木構造をつくる
 * @param questionId 木構造の1番上の親
 * @param questionList すべての質問が含まれているリスト
 */
const getQuestionChildrenTree = (
  questionId: d.QQuestionId,
  questionList: ReadonlyArray<d.QQuestion>
): ReadonlyArray<QuestionTree> => {
  const result: Array<QuestionTree> = [];
  for (const question of questionList) {
    if (question.parent._ === "Just" && question.parent.value === questionId) {
      result.push({
        id: question.id,
        text: question.name,
        children: getQuestionChildrenTree(question.id, questionList),
      });
    }
  }
  return result;
};
