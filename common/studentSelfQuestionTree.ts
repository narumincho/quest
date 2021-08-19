import * as d from "../data";

export const studentSelfQuestionTreeListFind = (
  treeList: ReadonlyArray<d.StudentSelfQuestionTree>,
  questionId: d.QuestionId
): d.StudentSelfQuestionTree | undefined => {
  for (const tree of treeList) {
    const result = studentSelfQuestionTreeFind(tree, questionId);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
};

export const studentSelfQuestionTreeFind = (
  tree: d.StudentSelfQuestionTree,
  questionId: d.QuestionId
): d.StudentSelfQuestionTree | undefined => {
  if (tree.questionId === questionId) {
    return tree;
  }
  return studentSelfQuestionTreeListFind(tree.children, questionId);
};
