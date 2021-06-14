import * as d from "../../data";
import {
  QuestionTree,
  getQuestionTree,
  questionChildren,
  getParentQuestionList as questionMapGetParentQuestionList,
  getQuestionThatCanBeParentList as questionMapGetQuestionThatCanBeParentList,
} from "./question";
import { mapSet, mapUpdate } from "../../common/map";

export type { QuestionTree };

/** ログインしたときに保存する管理する状態 */
export type LoggedInState = {
  readonly accountToken: d.AccountToken;
  readonly account: d.QAccount;
  readonly createdProgramList: ReadonlyMap<d.QProgramId, ProgramWithClassList>;
  readonly joinedClassList: ReadonlyArray<
    d.Tuple2<d.QClassStudentOrGuest, d.QRole>
  >;
  readonly questionDict: ReadonlyMap<d.QProgramId, QuestionListState>;
};

/** 作成したプログラムと作成したクラス */
export type ProgramWithClassList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly classList: ReadonlyArray<d.QClass>;
};

/** 質問の取得状態 */
export type QuestionListState =
  | {
      readonly tag: "Requesting";
    }
  | {
      readonly tag: "Error";
    }
  | {
      readonly tag: "Loaded";
      readonly questionMap: ReadonlyMap<d.QQuestionId, d.QQuestion>;
    };

export type QuestionTreeListWithLoadingState =
  | {
      readonly tag: "Empty";
    }
  | {
      readonly tag: "Requesting";
    }
  | {
      readonly tag: "Error";
    }
  | {
      readonly tag: "Loaded";
      readonly questionTreeList: ReadonlyArray<QuestionTree>;
    };

export const initLoggedInState = (option: {
  readonly accountToken: d.AccountToken;
  readonly accountData: d.QAccountData;
}): LoggedInState => {
  return {
    accountToken: option.accountToken,
    account: option.accountData.account,
    createdProgramList: new Map<d.QProgramId, ProgramWithClassList>(
      option.accountData.createdProgramList.map(
        (program): [d.QProgramId, ProgramWithClassList] => [
          program.id,
          {
            id: program.id,
            name: program.name,
            classList: option.accountData.createdClassList.filter(
              (qClass) => qClass.programId === program.id
            ),
            createAccountId: program.createAccountId,
          },
        ]
      )
    ),
    joinedClassList: option.accountData.joinedClassList,
    questionDict: new Map(),
  };
};

export const setProgram = (
  program: d.QProgram,
  beforeLoggedInState: LoggedInState
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    createdProgramList: mapSet(
      beforeLoggedInState.createdProgramList,
      program.id,
      {
        id: program.id,
        classList: [],
        createAccountId: program.createAccountId,
        name: program.name,
      }
    ),
  };
};

export const setQuestionListState = (
  beforeLoggedInState: LoggedInState,
  option: { programId: d.QProgramId; questionListState: QuestionListState }
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    questionDict: new Map(beforeLoggedInState.questionDict).set(
      option.programId,
      option.questionListState
    ),
  };
};

export const addCreatedClass = (
  beforeLoggedInState: LoggedInState,
  qClass: d.QClass
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    createdProgramList: mapUpdate(
      beforeLoggedInState.createdProgramList,
      qClass.programId,
      (beforeClass) => ({
        ...beforeClass,
        classList: [...beforeClass.classList, qClass],
      })
    ),
  };
};

export const addJoinedClass = (
  beforeLoggedInState: LoggedInState,
  option: { classStudentOrGuest: d.QClassStudentOrGuest; role: d.QRole }
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    joinedClassList: [
      ...beforeLoggedInState.joinedClassList,
      { first: option.classStudentOrGuest, second: option.role },
    ],
  };
};

export const addCreatedOrEditedQuestion = (
  beforeLoggedInState: LoggedInState,
  question: d.QQuestion
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    questionDict: mapUpdate(
      beforeLoggedInState.questionDict,
      question.programId,
      (questionListState) => {
        if (questionListState.tag !== "Loaded") {
          return questionListState;
        }
        return {
          tag: "Loaded",
          questionMap: mapSet(
            questionListState.questionMap,
            question.id,
            question
          ),
        };
      }
    ),
  };
};

export const getQuestionById = (
  loggedInState: LoggedInState,
  questionId: d.QQuestionId
): d.QQuestion | undefined => {
  for (const questionListState of loggedInState.questionDict.values()) {
    const question = getQuestionByIdInQuestionListState(
      questionListState,
      questionId
    );
    if (question !== undefined) {
      return question;
    }
  }
};

const getQuestionByIdInQuestionListState = (
  questionListState: QuestionListState,
  questionId: d.QQuestionId
): d.QQuestion | undefined => {
  if (questionListState.tag !== "Loaded") {
    return;
  }
  return questionListState.questionMap.get(questionId);
};

/** 質問の直接的な子を取得する */
export const getQuestionDirectChildren = (
  loggedInState: LoggedInState,
  questionId: d.QQuestionId
): ReadonlyArray<d.QQuestionId> => {
  const question = getQuestionById(loggedInState, questionId);
  if (question === undefined) {
    return [];
  }
  const questionListState = loggedInState.questionDict.get(question.programId);
  if (questionListState === undefined || questionListState.tag !== "Loaded") {
    return [];
  }
  return questionChildren(questionId, questionListState.questionMap);
};

export const getParentQuestionList = (
  loggedInState: LoggedInState,
  questionId: d.QQuestionId
): ReadonlyArray<d.QQuestion> => {
  const question = getQuestionById(loggedInState, questionId);
  if (question === undefined) {
    return [];
  }
  const questionListState = loggedInState.questionDict.get(question.programId);
  if (questionListState === undefined || questionListState.tag !== "Loaded") {
    return [];
  }
  return questionMapGetParentQuestionList(
    questionId,
    questionListState.questionMap
  );
};

export const getQuestionTreeListWithLoadingStateInProgram = (
  loggedInState: LoggedInState,
  programId: d.QProgramId
): QuestionTreeListWithLoadingState => {
  const questionListState = loggedInState.questionDict.get(programId);
  if (questionListState === undefined) {
    return { tag: "Empty" };
  }
  if (questionListState.tag === "Requesting") {
    return { tag: "Requesting" };
  }
  if (questionListState.tag === "Error") {
    return { tag: "Error" };
  }
  return {
    tag: "Loaded",
    questionTreeList: getQuestionTree(programId, [
      ...questionListState.questionMap.values(),
    ]),
  };
};

/** 親の質問になることができる質問を, キャッシュから取得する */
export const getQuestionThatCanBeParentList = (
  loggedInState: LoggedInState,
  programId: d.QProgramId,
  questionId: d.QQuestionId
): ReadonlyArray<d.QQuestion> => {
  const questionListState = loggedInState.questionDict.get(programId);
  if (questionListState === undefined || questionListState.tag !== "Loaded") {
    return [];
  }
  return questionMapGetQuestionThatCanBeParentList(
    programId,
    questionId,
    questionListState.questionMap
  );
};
