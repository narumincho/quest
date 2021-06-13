import * as d from "../../data";
import {
  LoggedInState,
  ProgramWithClassList,
  QuestionListState,
  QuestionTree,
  initLoggedInState,
  addCreatedClass as loggedInStateAddCreatedClass,
  addCreatedOrEditedQuestion as loggedInStateAddCreatedOrEditedQuestion,
  addJoinedClass as loggedInStateAddJoinedClass,
  getParentQuestionList as loggedInStateGetParentQuestionList,
  getQuestionById as loggedInStateGetQuestionById,
  getQuestionDirectChildren as loggedInStateGetQuestionDirectChildren,
  getQuestionThatCanBeParentList as loggedInStateGetQuestionThatCanBeParentList,
  getQuestionTreeListInProgram as loggedInStateGetQuestionTreeListInProgram,
  setProgram as loggedInStateSetProgram,
  setQuestionListState as loggedInStateSetQuestionListState,
} from "./loggedInState";
import { useCallback, useMemo, useState } from "react";

export type { LoggedInState, ProgramWithClassList, QuestionListState };

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
  /** 作成したクラスを保存する */
  readonly addCreatedClass: (qClass: d.QClass) => void;
  /** 参加したクラスをキャッシュに追加する */
  readonly addJoinedClass: (
    classStudentOrGuest: d.QClassStudentOrGuest,
    role: d.QRole
  ) => void;
  /** 作成した質問か編集した質問をキャッシュに保存する */
  readonly addCreatedOrEditedQuestion: (question: d.QQuestion) => void;
  /** 質問をIDから取得する */
  readonly getQuestionById: (
    questionId: d.QQuestionId
  ) => d.QQuestion | undefined;
  /** 質問の直接的な子を取得する */
  readonly getQuestionDirectChildren: (
    questionId: d.QQuestionId
  ) => ReadonlyArray<d.QQuestionId>;
  /** 質問の親を取得する */
  readonly getParentQuestionList: (
    questionId: d.QQuestionId
  ) => ReadonlyArray<d.QQuestion>;
  /** プログラムの質問の木構造を取得する */
  readonly getQuestionTreeListInProgram: (
    programId: d.QProgramId
  ) => ReadonlyArray<QuestionTree>;
  /** 親の質問になることができる質問を, キャッシュから取得する */
  readonly getQuestionThatCanBeParentList: (
    programId: d.QProgramId,
    questionId: d.QQuestionId
  ) => ReadonlyArray<d.QQuestion>;
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

  const addCreatedClass = useCallback((qClass: d.QClass): void => {
    setLogInState((beforeLogInState) => {
      if (beforeLogInState.tag !== "LoggedIn") {
        return beforeLogInState;
      }
      return {
        ...beforeLogInState,
        loggedInState: loggedInStateAddCreatedClass(
          beforeLogInState.loggedInState,
          qClass
        ),
      };
    });
  }, []);

  const addJoinedClass = useCallback(
    (classStudentOrGuest: d.QClassStudentOrGuest, role: d.QRole): void => {
      setLogInState((beforeLogInState) => {
        if (beforeLogInState.tag !== "LoggedIn") {
          return beforeLogInState;
        }
        return {
          ...beforeLogInState,
          loggedInState: loggedInStateAddJoinedClass(
            beforeLogInState.loggedInState,
            { classStudentOrGuest, role }
          ),
        };
      });
    },
    []
  );

  const addCreatedQuestion = useCallback((question: d.QQuestion) => {
    setLogInState((beforeLogInState) => {
      if (beforeLogInState.tag !== "LoggedIn") {
        return beforeLogInState;
      }
      return {
        ...beforeLogInState,
        loggedInState: loggedInStateAddCreatedOrEditedQuestion(
          beforeLogInState.loggedInState,
          question
        ),
      };
    });
  }, []);

  const getQuestionById = useCallback(
    (questionId: d.QQuestionId): d.QQuestion | undefined => {
      if (logInState.tag !== "LoggedIn") {
        return undefined;
      }
      return loggedInStateGetQuestionById(logInState.loggedInState, questionId);
    },
    [logInState]
  );

  const getQuestionDirectChildren = useCallback(
    (questionId: d.QQuestionId): ReadonlyArray<d.QQuestionId> => {
      if (logInState.tag !== "LoggedIn") {
        return [];
      }
      return loggedInStateGetQuestionDirectChildren(
        logInState.loggedInState,
        questionId
      );
    },
    [logInState]
  );

  const getParentQuestionList = useCallback(
    (questionId: d.QQuestionId): ReadonlyArray<d.QQuestion> => {
      if (logInState.tag !== "LoggedIn") {
        return [];
      }
      return loggedInStateGetParentQuestionList(
        logInState.loggedInState,
        questionId
      );
    },
    [logInState]
  );

  const getQuestionTreeListInProgram = useCallback(
    (programId: d.QProgramId) => {
      if (logInState.tag !== "LoggedIn") {
        return [];
      }
      return loggedInStateGetQuestionTreeListInProgram(
        logInState.loggedInState,
        programId
      );
    },
    [logInState]
  );

  const getQuestionThatCanBeParentList = useCallback(
    (
      programId: d.QProgramId,
      questionId: d.QQuestionId
    ): ReadonlyArray<d.QQuestion> => {
      if (logInState.tag !== "LoggedIn") {
        return [];
      }
      return loggedInStateGetQuestionThatCanBeParentList(
        logInState.loggedInState,
        programId,
        questionId
      );
    },
    [logInState]
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
      addCreatedClass,
      addJoinedClass,
      addCreatedOrEditedQuestion: addCreatedQuestion,
      getQuestionById,
      getQuestionDirectChildren,
      getParentQuestionList,
      getQuestionTreeListInProgram,
      getQuestionThatCanBeParentList,
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
      addCreatedClass,
      addJoinedClass,
      addCreatedQuestion,
      getQuestionById,
      getQuestionDirectChildren,
      getParentQuestionList,
      getQuestionTreeListInProgram,
      getQuestionThatCanBeParentList,
    ]
  );
};
