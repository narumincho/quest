import * as d from "../../data";
import {
  LoggedInState,
  QuestionListState,
  initLoggedInState,
  setProgram as loggedInStateSetProgram,
  setQuestionListState as loggedInStateSetQuestionListState,
} from "./loggedInState";
import { useCallback, useMemo, useState } from "react";

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
      readonly loggedInState: LoggedInState;
    }
  | {
      /** ログインURLを取得中 */
      readonly tag: "RequestingLogInUrl";
    }
  | {
      /** ログインURLを取得して, 移動中 */
      readonly tag: "JumpingPage";
    };

export type logInStateResult = {
  /** ログイン状態 */
  readonly logInState: LogInState;
  /** ログインしていないことが判明したので, ログインしていない状態にする */
  readonly setNoLogIn: () => void;
  /** ログイン処理中というように設定する */
  readonly setVerifyingAccountToken: (accountToken: d.AccountToken) => void;
  /** ログインURLを取得中  */
  readonly setRequestingLogInUrl: () => void;
  /** ログインURLに移動中 */
  readonly setJumpingPage: () => void;
  /** ログイン処理に成功しログインした */
  readonly setLoggedIn: (
    accountData: d.QAccountData,
    accountToken: d.AccountToken
  ) => void;
  /** 自分のプログラムを編集した分を変数キャッシュに保存する */
  readonly setProgram: (program: d.QProgram) => void;
  /** プロジェクトに対する質問の取得データと取得状態を保存する */
  readonly setQuestionListState: (
    programId: d.QProgramId,
    questionListState: QuestionListState
  ) => void;
};

export const useLogInState = (): logInStateResult => {
  const [logInState, setLogInState] = useState<LogInState>({ tag: "Loading" });

  const setNoLogIn = useCallback((): void => {
    setLogInState({ tag: "NoLogin" });
  }, []);

  const setVerifyingAccountToken = useCallback(
    (accountToken: d.AccountToken): void => {
      setLogInState({ tag: "VerifyingAccountToken", accountToken });
    },
    []
  );

  const setLoggedIn = useCallback(
    (accountData: d.QAccountData, accountToken: d.AccountToken): void => {
      setLogInState({
        tag: "LoggedIn",
        loggedInState: initLoggedInState({ accountToken, accountData }),
      });
    },
    []
  );

  const setRequestingLogInUrl = useCallback((): void => {
    setLogInState({
      tag: "RequestingLogInUrl",
    });
  }, []);

  const setJumpingPage = useCallback((): void => {
    setLogInState({
      tag: "JumpingPage",
    });
  }, []);

  const setProgram = useCallback((program: d.QProgram): void => {
    setLogInState((beforeLogInState) => {
      if (beforeLogInState.tag !== "LoggedIn") {
        return beforeLogInState;
      }

      return {
        tag: "LoggedIn",
        loggedInState: loggedInStateSetProgram(
          program,
          beforeLogInState.loggedInState
        ),
      };
    });
  }, []);

  const setQuestionListState = useCallback(
    (programId: d.QProgramId, questionListState: QuestionListState): void => {
      setLogInState((beforeLogInState) => {
        if (beforeLogInState.tag !== "LoggedIn") {
          return beforeLogInState;
        }
        return {
          ...beforeLogInState,
          loggedInState: loggedInStateSetQuestionListState(
            beforeLogInState.loggedInState,
            {
              programId,
              questionListState,
            }
          ),
        };
      });
    },
    []
  );

  return useMemo<logInStateResult>(
    () => ({
      logInState,
      setNoLogIn,
      setVerifyingAccountToken,
      setLoggedIn,
      setRequestingLogInUrl,
      setJumpingPage,
      setProgram,
      setQuestionListState,
    }),
    [
      logInState,
      setNoLogIn,
      setVerifyingAccountToken,
      setLoggedIn,
      setRequestingLogInUrl,
      setJumpingPage,
      setProgram,
      setQuestionListState,
    ]
  );
};
