import * as d from "../../data";
import { questionParentIsValid } from "../../common/validation";

/** 質問の木構造 */
export type QuestionTree = {
  readonly id: d.QuestionId;
  readonly text: string;
  readonly children: ReadonlyArray<QuestionTree>;
};

export type UseQuestionMapResult = {
  /** 質問をリロードするまで保存する */
  readonly setQuestion: (question: d.Question) => void;
  /** 複数の質問を一度にリロードするまで保存する */
  readonly setQuestionList: (questionList: ReadonlyArray<d.Question>) => void;
  /** QuestionId から 質問を得る */
  readonly questionById: (id: d.QuestionId) => d.Question | undefined;
};

export const getQuestionThatCanBeParentList = (
  programId: d.ProgramId,
  questionId: d.QuestionId,
  questionMap: ReadonlyMap<d.QuestionId, d.Question>
): ReadonlyArray<d.Question> => {
  const result: Array<d.Question> = [];
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
  id: d.QuestionId,
  questionMap: ReadonlyMap<d.QuestionId, d.Question>
): ReadonlyArray<d.QuestionId> => {
  const result: Array<d.QuestionId> = [];
  for (const question of questionMap.values()) {
    if (question.parent._ === "Some" && question.parent.value === id) {
      result.push(question.id);
    }
  }
  return result;
};

/** 親の質問になることができる質問を, キャッシュから取得する */
export const getParentQuestionList = (
  id: d.QuestionId,
  questionMap: ReadonlyMap<d.QuestionId, d.Question>
): ReadonlyArray<d.Question> => {
  let targetId = id;
  const result: Array<d.Question> = [];
  while (true) {
    const question = questionMap.get(targetId);
    if (question === undefined) {
      return result;
    }
    result.push(question);
    if (question.parent._ === "None") {
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
  programId: d.ProgramId,
  questionList: ReadonlyArray<d.Question>
): ReadonlyArray<QuestionTree> => {
  const treeList: Array<QuestionTree> = [];
  for (const question of questionList) {
    if (question.programId === programId && question.parent._ === "None") {
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
  questionId: d.QuestionId,
  questionList: ReadonlyArray<d.Question>
): ReadonlyArray<QuestionTree> => {
  const result: Array<QuestionTree> = [];
  for (const question of questionList) {
    if (question.parent._ === "Some" && question.parent.value === questionId) {
      result.push({
        id: question.id,
        text: question.name,
        children: getQuestionChildrenTree(question.id, questionList),
      });
    }
  }
  return result;
};
