import * as d from "../../data";
import {
  QuestionTree,
  getQuestionTree,
  questionChildren,
  getParentQuestionList as questionMapGetParentQuestionList,
  getQuestionThatCanBeParentList as questionMapGetQuestionThatCanBeParentList,
} from "./question";
import { mapSet, mapUpdate, mapUpdateAllValue } from "../../common/map";

export type { QuestionTree };

/** ログインしたときに保存する管理する状態 */
export type LoggedInState = {
  readonly accountToken: d.AccountToken;
  readonly account: d.Account;
  readonly createdProgramMap: ReadonlyMap<d.ProgramId, ProgramWithClassList>;
  readonly joinedClassMap: ReadonlyMap<d.ClassId, JoinedClass>;
  readonly questionMap: ReadonlyMap<d.ProgramId, QuestionListState>;
  readonly accountMap: ReadonlyMap<d.AccountId, d.Account>;
};

/** 作成したプログラムと作成したクラス */
export type ProgramWithClassList = {
  readonly id: d.ProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly classList: ReadonlyArray<ClassWithParticipantList>;
};

/**
 * クラスと参加者の一覧
 */
export type ClassWithParticipantList = {
  readonly qClass: d.AdminClass;
  /**
   * 参加者一覧. `undefined` は取得中か失敗
   */
  readonly participantList:
    | ReadonlyArray<ParticipantAndConfirmedAnswer>
    | undefined;
};

export type ParticipantAndConfirmedAnswer =
  | {
      readonly role: "student";
      readonly account: d.Account;
      readonly confirmedAnswerList: ReadonlyArray<d.ConfirmedAnswer>;
    }
  | { readonly role: "guest"; readonly account: d.Account };

/** 参加したクラス */
export type JoinedClass = {
  readonly class: d.ParticipantClass;

  /**
   * 参加者一覧. `undefined` は取得中か失敗
   */
  readonly participantList: ReadonlyArray<d.Participant> | undefined;

  /**
   * 質問と自身の回答状況
   */
  readonly questionTreeList:
    | ReadonlyArray<d.StudentSelfQuestionTree>
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
      readonly questionMap: ReadonlyMap<d.QuestionId, d.Question>;
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
  readonly accountData: d.AccountData;
}): LoggedInState => {
  return {
    accountToken: option.accountToken,
    account: option.accountData.account,
    createdProgramMap: new Map<d.ProgramId, ProgramWithClassList>(
      option.accountData.createdProgramList.map(
        (program): [d.ProgramId, ProgramWithClassList] => [
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
    joinedClassMap: new Map<d.ClassId, JoinedClass>(
      option.accountData.joinedClassList.map((participantClass) => [
        participantClass.id,
        {
          class: participantClass,
          participantList: undefined,
          questionTreeList: undefined,
        },
      ])
    ),
    questionMap: new Map(),
    accountMap: new Map<d.AccountId, d.Account>([
      [option.accountData.account.id, option.accountData.account],
    ]),
  };
};

export const setProgram = (
  beforeLoggedInState: LoggedInState,
  program: d.Program
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
  option: { programId: d.ProgramId; questionListState: QuestionListState }
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
  qClass: d.AdminClass
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
  participantClass: d.ParticipantClass
): LoggedInState => {
  return {
    ...beforeLoggedInState,
    joinedClassMap: new Map([
      ...beforeLoggedInState.joinedClassMap,
      [
        participantClass.id,
        {
          class: participantClass,
          participantList: undefined,
          questionTreeList: undefined,
        },
      ],
    ]),
  };
};

export const addCreatedOrEditedQuestion = (
  beforeLoggedInState: LoggedInState,
  question: d.Question
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
  questionId: d.QuestionId
): d.Question | undefined => {
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
  questionId: d.QuestionId
): d.Question | undefined => {
  if (questionListState.tag !== "Loaded") {
    return;
  }
  return questionListState.questionMap.get(questionId);
};

/** 質問の直接的な子を取得する */
export const getQuestionDirectChildren = (
  loggedInState: LoggedInState,
  questionId: d.QuestionId
): ReadonlyArray<d.QuestionId> => {
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
  questionId: d.QuestionId
): ReadonlyArray<d.Question> => {
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
  programId: d.ProgramId
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
  programId: d.ProgramId,
  questionId: d.QuestionId
): ReadonlyArray<d.Question> => {
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
  classId: d.ClassId
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
  classId: d.ClassId,
  participantList: ReadonlyArray<d.Participant>
): LoggedInState => {
  return {
    ...loggedInState,
    createdProgramMap: new Map<d.ProgramId, ProgramWithClassList>(
      mapUpdateAllValue(loggedInState.createdProgramMap, (program) => ({
        ...program,
        classList: program.classList.map((qClass): ClassWithParticipantList => {
          if (qClass.qClass.id === classId) {
            return {
              qClass: qClass.qClass,
              participantList: participantList.map(
                (participant): ParticipantAndConfirmedAnswer =>
                  participant.role === d.ClassParticipantRole.Guest
                    ? { role: "guest", account: participant.account }
                    : {
                        role: "student",
                        account: participant.account,
                        confirmedAnswerList: [],
                      }
              ),
            };
          }
          return qClass;
        }),
      }))
    ),
    joinedClassMap: new Map(
      [...loggedInState.joinedClassMap.values()].map((joinedClass) => {
        return [
          joinedClass.class.id,
          {
            ...joinedClass,
            participantList:
              joinedClass.class.id === classId
                ? participantList
                : joinedClass.participantList,
          },
        ];
      })
    ),
  };
};

export const setStudentQuestionTree = (
  loggedInState: LoggedInState,
  classId: d.ClassId,
  questionTreeList: ReadonlyArray<d.StudentSelfQuestionTree> | undefined
): LoggedInState => {
  return {
    ...loggedInState,
    joinedClassMap: new Map(
      [...loggedInState.joinedClassMap.values()].map((joinedClass) => {
        return [
          joinedClass.class.id,
          {
            ...joinedClass,
            questionTreeList:
              joinedClass.class.id === classId
                ? questionTreeList
                : joinedClass.questionTreeList,
          },
        ];
      })
    ),
  };
};

/**
 * 作成したクラスからプロジェクト を取得する
 * @param loggedInState
 * @param classId
 * @returns
 */
export const getCreatedProgramIdByClassId = (
  loggedInState: LoggedInState,
  classId: d.ClassId
): d.Program | undefined => {
  for (const createdProgram of loggedInState.createdProgramMap.values()) {
    for (const classItem of createdProgram.classList) {
      if (classItem.qClass.id === classId) {
        return createdProgram;
      }
    }
  }
};

export const getClassNameAndStudent = (
  loggedInState: LoggedInState,
  classId: d.ClassId,
  studentAccountId: d.AccountId
):
  | {
      readonly className: string;
      readonly studentName: string;
      readonly studentImageHashValue: d.ImageHashValue;
    }
  | undefined => {
  const classItem = getClassWithParticipantListByClassId(
    loggedInState,
    classId
  );
  if (classItem === undefined) {
    return;
  }

  if (classItem.participantList === undefined) {
    return;
  }
  const studentAccount = getStudentInParticipantList(
    classItem.participantList,
    studentAccountId
  );
  if (studentAccount === undefined) {
    return undefined;
  }
  return {
    className: classItem.qClass.name,
    studentImageHashValue: studentAccount.iconHash,
    studentName: studentAccount.name,
  };
};

const getStudentInParticipantList = (
  participantAndAnswerList: ReadonlyArray<ParticipantAndConfirmedAnswer>,
  studentAccountId: d.AccountId
): d.Account | undefined => {
  for (const participant of participantAndAnswerList) {
    if (
      participant.role === "student" &&
      participant.account.id === studentAccountId
    ) {
      return participant.account;
    }
  }
};

export const getStudentConfirmedAnswer = (
  loggedInState: LoggedInState,
  classId: d.ClassId,
  studentAccountId: d.AccountId,
  questionId: d.QuestionId
): d.ConfirmedAnswer | undefined => {
  const classItem = getClassWithParticipantListByClassId(
    loggedInState,
    classId
  );
  if (classItem === undefined) {
    return;
  }

  if (classItem.participantList === undefined) {
    return;
  }
  for (const participant of classItem.participantList) {
    if (
      participant.role === "student" &&
      participant.account.id === studentAccountId
    ) {
      return participant.confirmedAnswerList.find(
        (answer) => answer.questionId === questionId
      );
    }
  }
};

const getClassWithParticipantListByClassId = (
  loggedInState: LoggedInState,
  classId: d.ClassId
): ClassWithParticipantList | undefined => {
  for (const createdProgram of loggedInState.createdProgramMap.values()) {
    for (const classItem of createdProgram.classList) {
      if (classItem.qClass.id === classId) {
        return classItem;
      }
    }
  }
};

export const setConfirmedAnswerList = (
  loggedInState: LoggedInState,
  classId: d.ClassId,
  accountId: d.AccountId,
  list: ReadonlyArray<d.ConfirmedAnswer>
): LoggedInState => {
  return {
    ...loggedInState,
    createdProgramMap: mapUpdateAllValue(
      loggedInState.createdProgramMap,
      (program) => ({
        ...program,
        classList: program.classList.map((classItem) => {
          if (classItem.qClass.id === classId) {
            return {
              ...classItem,
              participantList: classItem.participantList?.map(
                (participant): ParticipantAndConfirmedAnswer => {
                  if (
                    participant.account.id === accountId &&
                    participant.role === "student"
                  ) {
                    return {
                      role: "student",
                      account: participant.account,
                      confirmedAnswerList: list,
                    };
                  }
                  return participant;
                }
              ),
            };
          }
          return classItem;
        }),
      })
    ),
  };
};

/**
 * ロール関係なしにアカウントの名前とアイコン画像をキャッシュから取得する
 */
export const getAccountById = (
  loggedInState: LoggedInState,
  accountId: d.AccountId
): d.Account | undefined => {
  const accountMapResult = loggedInState.accountMap.get(accountId);
  if (accountMapResult !== undefined) {
    return accountMapResult;
  }
  for (const joinedClass of loggedInState.joinedClassMap.values()) {
    const result = getAccountInParticipantList(
      joinedClass.participantList,
      accountId
    );
    if (result !== undefined) {
      return result;
    }
  }
  for (const createdProgram of loggedInState.createdProgramMap.values()) {
    for (const createdClass of createdProgram.classList) {
      const result = getAccountInparticipantAndConfirmedAnswerList(
        createdClass.participantList,
        accountId
      );
      if (result !== undefined) {
        return result;
      }
    }
  }
};

const getAccountInParticipantList = (
  participantList: ReadonlyArray<d.Participant> | undefined,
  accountId: d.AccountId
): d.Account | undefined => {
  if (participantList === undefined) {
    return;
  }
  for (const participant of participantList) {
    if (participant.account.id === accountId) {
      return participant.account;
    }
  }
};

const getAccountInparticipantAndConfirmedAnswerList = (
  participantAndConfirmedAnswer:
    | ReadonlyArray<ParticipantAndConfirmedAnswer>
    | undefined,
  accountId: d.AccountId
): d.Account | undefined => {
  if (participantAndConfirmedAnswer === undefined) {
    return;
  }
  for (const participant of participantAndConfirmedAnswer) {
    if (participant.account.id === accountId) {
      return participant.account;
    }
  }
};
