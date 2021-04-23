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
  deleteAll: () => void;
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
  };
};

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
        children: getQuestionChildren(question.id, questionList),
      });
    }
  }
  return treeList;
};

const getQuestionChildren = (
  questionId: d.QQuestionId,
  questionList: ReadonlyArray<d.QQuestion>
): ReadonlyArray<QuestionTree> => {
  const result: Array<QuestionTree> = [];
  for (const question of questionList) {
    if (question.parent._ === "Just" && question.parent.value === questionId) {
      result.push({
        id: question.id,
        text: question.name,
        children: getQuestionChildren(question.id, questionList),
      });
    }
  }
  return result;
};
