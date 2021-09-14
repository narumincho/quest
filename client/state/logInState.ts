import * as d from "../../data";
import * as ls from "./loggedInState";

export type LogInState =
  | {
      /** ログインしているか, 判断中 */
      readonly tag: "Loading";
    }
  | {
      /** ログインしていない */
      readonly tag: "NoLogin";
    }
  | {
      /** アカウントの情報を取得中 */
      readonly tag: "VerifyingAccountToken";
      readonly accountToken: d.AccountToken;
    }
  | {
      /** ログインしている */
      readonly tag: "LoggedIn";
      readonly loggedInState: ls.LoggedInState;
    }
  | {
      /** ログインURLを取得中 */
      readonly tag: "RequestingLogInUrl";
    }
  | {
      /** ログインURLを取得して, 移動中 */
      readonly tag: "JumpingPage";
    };

/** ログイン処理に成功しログインした */
export const loggedIn = (
  accountData: d.AccountData,
  accountToken: d.AccountToken
): LogInState => {
  return {
    tag: "LoggedIn",
    loggedInState: ls.initLoggedInState({ accountToken, accountData }),
  };
};

/** 質問をIDから取得する */
export const getQuestionById = (
  logInState: LogInState,
  questionId: d.QuestionId
): d.Question | undefined => {
  if (logInState.tag !== "LoggedIn") {
    return undefined;
  }
  return ls.getQuestionById(logInState.loggedInState, questionId);
};

/** 質問の直接的な子を取得する */
export const getQuestionDirectChildren = (
  logInState: LogInState,
  questionId: d.QuestionId
): ReadonlyArray<d.QuestionId> => {
  if (logInState.tag !== "LoggedIn") {
    return [];
  }
  return ls.getQuestionDirectChildren(logInState.loggedInState, questionId);
};

/** 質問の親を取得する */
export const getParentQuestionList = (
  logInState: LogInState,
  questionId: d.QuestionId
): ReadonlyArray<d.Question> => {
  if (logInState.tag !== "LoggedIn") {
    return [];
  }
  return ls.getParentQuestionList(logInState.loggedInState, questionId);
};

/** プログラムの質問の木構造を取得する */
export const getQuestionTreeListWithLoadingStateInProgram = (
  logInState: LogInState,
  programId: d.ProgramId
): ls.QuestionTreeListWithLoadingState => {
  if (logInState.tag !== "LoggedIn") {
    return { tag: "Empty" };
  }
  return ls.getQuestionTreeListWithLoadingStateInProgram(
    logInState.loggedInState,
    programId
  );
};

/** 親の質問になることができる質問を, キャッシュから取得する */
export const getQuestionThatCanBeParentList = (
  logInState: LogInState,
  programId: d.ProgramId,
  questionId: d.QuestionId
): ReadonlyArray<d.Question> => {
  if (logInState.tag !== "LoggedIn") {
    return [];
  }
  return ls.getQuestionThatCanBeParentList(
    logInState.loggedInState,
    programId,
    questionId
  );
};

/** クラスとクラスへの所属の種類を取得する */
export const getClassAndRole = (
  logInState: LogInState,
  classId: d.ClassId
): ls.ClassAndRole => {
  if (logInState.tag !== "LoggedIn") {
    return { tag: "none" };
  }
  return ls.getClassAndRole(logInState.loggedInState, classId);
};

/** 生徒として参加したクラスの質問と回答状況をキャッシュから取得する */
export const getStudentQuestionTree = (
  logInState: LogInState,
  classId: d.ClassId
): ReadonlyArray<d.StudentSelfQuestionTree> | undefined => {
  if (logInState.tag !== "LoggedIn") {
    return undefined;
  }
  const joinedClass = logInState.loggedInState.joinedClassMap.get(classId);
  if (joinedClass === undefined) {
    return undefined;
  }
  return joinedClass.questionTreeList;
};

export const updateLoggedInState =
  (func: (loggedInState: ls.LoggedInState) => ls.LoggedInState) =>
  (beforeLogInState: LogInState): LogInState => {
    if (beforeLogInState.tag !== "LoggedIn") {
      return beforeLogInState;
    }
    return {
      ...beforeLogInState,
      loggedInState: func(beforeLogInState.loggedInState),
    };
  };
