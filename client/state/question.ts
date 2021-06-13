import * as d from "../../data";
import { questionParentIsValid } from "../../common/validation";

/** 質問の木構造 */
export type QuestionTree = {
  readonly id: d.QQuestionId;
  readonly text: string;
  readonly children: ReadonlyArray<QuestionTree>;
};

export type UseQuestionMapResult = {
  /** 質問をリロードするまで保存する */
  readonly setQuestion: (question: d.QQuestion) => void;
  /** 複数の質問を一度にリロードするまで保存する */
  readonly setQuestionList: (questionList: ReadonlyArray<d.QQuestion>) => void;
  /** QuestionId から 質問を得る */
  readonly questionById: (id: d.QQuestionId) => d.QQuestion | undefined;
};

export const getQuestionThatCanBeParentList = (
  programId: d.QProgramId,
  questionId: d.QQuestionId,
  questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>
): ReadonlyArray<d.QQuestion> => {
  const result: Array<d.QQuestion> = [];
  for (const question of questionMap.values()) {
    const validationResult = questionParentIsValid(
      question.id,
      questionId,
      programId,
      questionMap
    );
    if (validationResult.isValid) {
      result.push(question);
    }
  }
  return result;
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

/** 親の質問になることができる質問を, キャッシュから取得する */
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
