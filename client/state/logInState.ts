import * as d from "../../data";
import * as ls from "./loggedInState";

/**
 * ログイン状態とログインしているときに保持するデータなど
 */
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
