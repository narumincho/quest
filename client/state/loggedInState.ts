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
  readonly createdProgramMap: ReadonlyMap<d.QProgramId, ProgramWithClassList>;
  readonly joinedClassMap: ReadonlyMap<d.QClassId, JoinedClass>;
  readonly questionMap: ReadonlyMap<d.QProgramId, QuestionListState>;
};

/** 作成したプログラムと作成したクラス */
export type ProgramWithClassList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly classList: ReadonlyArray<ClassWithParticipantList>;
};

/**
 * クラスと参加者の一覧
 */
export type ClassWithParticipantList = {
  readonly qClass: d.QClass;
  /**
   * 参加者一覧. `undefined` は取得中か失敗
   */
  readonly participantList:
    | ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
    | undefined;
};

/** 参加したクラス */
export type JoinedClass = {
  readonly class: d.QClassStudentOrGuest;

  readonly role: d.QRole;
  /**
   * 参加者一覧. `undefined` は取得中か失敗
   */
  readonly participantList:
    | ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
    | undefined;
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

export type ClassAndRole =
  | {
      readonly tag: "admin";
      readonly classWithParticipantList: ClassWithParticipantList;
    }
  | {
      readonly tag: "participant";
      readonly joinedClass: JoinedClass;
    }
  | {
      readonly tag: "none";
    };

export const initLoggedInState = (option: {
  readonly accountToken: d.AccountToken;
  readonly accountData: d.QAccountData;
}): LoggedInState => {
  return {
    accountToken: option.accountToken,
    account: option.accountData.account,
    createdProgramMap: new Map<d.QProgramId, ProgramWithClassList>(
      option.accountData.createdProgramList.map(
        (program): [d.QProgramId, ProgramWithClassList] => [
          program.id,
          {
            id: program.id,
            name: program.name,
            classList: option.accountData.createdClassList
              .filter((qClass) => qClass.programId === program.id)
              .map(
                (qClass): ClassWithParticipantList => ({
                  qClass,
                  participantList: undefined,
                })
              ),
            createAccountId: program.createAccountId,
          },
        ]
      )
    ),
    joinedClassMap: new Map<d.QClassId, JoinedClass>(
      option.accountData.joinedClassList.map((tuple) => [
        tuple.first.id,
        {
          class: tuple.first,
          role: tuple.second,
          participantList: undefined,
        },
      ])
    ),
    questionMap: new Map(),
  };
};

export const setProgram = (
  program: d.QProgram,
  beforeLoggedInState: LoggedInState
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    createdProgramMap: mapSet(
      beforeLoggedInState.createdProgramMap,
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
    questionMap: new Map(beforeLoggedInState.questionMap).set(
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
    createdProgramMap: mapUpdate(
      beforeLoggedInState.createdProgramMap,
      qClass.programId,
      (beforeClass) => ({
        ...beforeClass,
        classList: [
          ...beforeClass.classList,
          { qClass, participantList: undefined },
        ],
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
    joinedClassMap: new Map([
      ...beforeLoggedInState.joinedClassMap,
      [
        option.classStudentOrGuest.id,
        {
          class: option.classStudentOrGuest,
          role: option.role,
          participantList: undefined,
        },
      ],
    ]),
  };
};

export const addCreatedOrEditedQuestion = (
  beforeLoggedInState: LoggedInState,
  question: d.QQuestion
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    questionMap: mapUpdate(
      beforeLoggedInState.questionMap,
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
  for (const questionListState of loggedInState.questionMap.values()) {
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
  const questionListState = loggedInState.questionMap.get(question.programId);
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
  const questionListState = loggedInState.questionMap.get(question.programId);
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
  const questionListState = loggedInState.questionMap.get(programId);
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
  const questionListState = loggedInState.questionMap.get(programId);
  if (questionListState === undefined || questionListState.tag !== "Loaded") {
    return [];
  }
  return questionMapGetQuestionThatCanBeParentList(
    programId,
    questionId,
    questionListState.questionMap
  );
};

export const getClassAndRole = (
  loggedInState: LoggedInState,
  classId: d.QClassId
): ClassAndRole => {
  for (const createdProgram of loggedInState.createdProgramMap.values()) {
    for (const classWithParticipantList of createdProgram.classList) {
      if (classWithParticipantList.qClass.id === classId) {
        return {
          tag: "admin",
          classWithParticipantList,
        };
      }
    }
  }
  const joinedClass = loggedInState.joinedClassMap.get(classId);
  if (joinedClass !== undefined) {
    return {
      tag: "participant",
      joinedClass,
    };
  }
  return {
    tag: "none",
  };
};

export const setClassParticipantList = (
  loggedInState: LoggedInState,
  classId: d.QClassId,
  participantList: ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
): LoggedInState => {
  return {
    ...loggedInState,
    createdProgramMap: new Map<d.QProgramId, ProgramWithClassList>(
      [...loggedInState.createdProgramMap.values()].map((program) => {
        return [
          program.id,
          {
            ...program,
            classList: program.classList.map(
              (qClass): ClassWithParticipantList => {
                if (qClass.qClass.id === classId) {
                  return { qClass: qClass.qClass, participantList };
                }
                return qClass;
              }
            ),
          },
        ];
      })
    ),
  };
};
