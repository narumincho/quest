import * as d from "../../data";
import {
  ClassAndRole,
  LoggedInState,
  ProgramWithClassList,
  QuestionListState,
  QuestionTreeListWithLoadingState,
  initLoggedInState,
  addCreatedClass as loggedInStateAddCreatedClass,
  addCreatedOrEditedQuestion as loggedInStateAddCreatedOrEditedQuestion,
  addJoinedClass as loggedInStateAddJoinedClass,
  getClassAndRole as loggedInStateGetClassAndRole,
  getParentQuestionList as loggedInStateGetParentQuestionList,
  getQuestionById as loggedInStateGetQuestionById,
  getQuestionDirectChildren as loggedInStateGetQuestionDirectChildren,
  getQuestionThatCanBeParentList as loggedInStateGetQuestionThatCanBeParentList,
  getQuestionTreeListWithLoadingStateInProgram as loggedInStateGetQuestionTreeListWithLoadingStateInProgram,
  setClassParticipantList as loggedInStateSetClassParticipantList,
  setProgram as loggedInStateSetProgram,
  setQuestionListState as loggedInStateSetQuestionListState,
  setQuestionTree as loggedInStateSetQuestionTree,
} from "./loggedInState";
import { useCallback, useMemo, useState } from "react";

export type {
  LoggedInState,
  ProgramWithClassList,
  QuestionListState,
  QuestionTreeListWithLoadingState,
  ClassAndRole,
};

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
    accountData: d.AccountData,
    accountToken: d.AccountToken
  ) => void;
  /** 自分のプログラムを編集した分を変数キャッシュに保存する */
  readonly setProgram: (program: d.Program) => void;
  /** プロジェクトに対する質問の取得データと取得状態を保存する */
  readonly setQuestionListState: (
    programId: d.ProgramId,
    questionListState: QuestionListState
  ) => void;
  /** 作成したクラスを保存する */
  readonly addCreatedClass: (qClass: d.AdminClass) => void;
  /** 参加したクラスをキャッシュに追加する */
  readonly addJoinedClass: (
    participantClass: d.ParticipantClass,
    role: d.ClassParticipantRole
  ) => void;
  /** 作成した質問か編集した質問をキャッシュに保存する */
  readonly addCreatedOrEditedQuestion: (question: d.Question) => void;
  /** 質問をIDから取得する */
  readonly getQuestionById: (
    questionId: d.QuestionId
  ) => d.Question | undefined;
  /** 質問の直接的な子を取得する */
  readonly getQuestionDirectChildren: (
    questionId: d.QuestionId
  ) => ReadonlyArray<d.QuestionId>;
  /** 質問の親を取得する */
  readonly getParentQuestionList: (
    questionId: d.QuestionId
  ) => ReadonlyArray<d.Question>;
  /** プログラムの質問の木構造を取得する */
  readonly getQuestionTreeListWithLoadingStateInProgram: (
    programId: d.ProgramId
  ) => QuestionTreeListWithLoadingState;
  /** 親の質問になることができる質問を, キャッシュから取得する */
  readonly getQuestionThatCanBeParentList: (
    programId: d.ProgramId,
    questionId: d.QuestionId
  ) => ReadonlyArray<d.Question>;
  /** クラスとクラスへの所属の種類を取得する */
  readonly getClassAndRole: (classId: d.ClassId) => ClassAndRole;
  /** クラスの参加者をキャッシュに保存する */
  readonly setClassParticipantList: (
    classId: d.ClassId,
    participantList: ReadonlyArray<d.Participant>
  ) => void;
  /** 生徒として参加したクラスの質問と回答状況をキャッシュに保存する */
  readonly setStudentQuestionTree: (
    classId: d.ClassId,
    tree: ReadonlyArray<d.StudentSelfQuestionTree>
  ) => void;
  /** 生徒として参加したクラスの質問と回答状況をキャッシュから取得する */
  readonly getStudentQuestionTree: (
    classId: d.ClassId
  ) => ReadonlyArray<d.StudentSelfQuestionTree> | undefined;
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
    (accountData: d.AccountData, accountToken: d.AccountToken): void => {
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

  const setProgram = useCallback((program: d.Program): void => {
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
    (programId: d.ProgramId, questionListState: QuestionListState): void => {
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

  const addCreatedClass = useCallback((qClass: d.AdminClass): void => {
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
    (participantClass: d.ParticipantClass): void => {
      setLogInState((beforeLogInState) => {
        if (beforeLogInState.tag !== "LoggedIn") {
          return beforeLogInState;
        }
        return {
          ...beforeLogInState,
          loggedInState: loggedInStateAddJoinedClass(
            beforeLogInState.loggedInState,
            participantClass
          ),
        };
      });
    },
    []
  );

  const addCreatedOrEditedQuestion = useCallback((question: d.Question) => {
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
    (questionId: d.QuestionId): d.Question | undefined => {
      if (logInState.tag !== "LoggedIn") {
        return undefined;
      }
      return loggedInStateGetQuestionById(logInState.loggedInState, questionId);
    },
    [logInState]
  );

  const getQuestionDirectChildren = useCallback(
    (questionId: d.QuestionId): ReadonlyArray<d.QuestionId> => {
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
    (questionId: d.QuestionId): ReadonlyArray<d.Question> => {
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

  const getQuestionTreeListWithLoadingStateInProgram = useCallback(
    (programId: d.ProgramId): QuestionTreeListWithLoadingState => {
      if (logInState.tag !== "LoggedIn") {
        return { tag: "Empty" };
      }
      return loggedInStateGetQuestionTreeListWithLoadingStateInProgram(
        logInState.loggedInState,
        programId
      );
    },
    [logInState]
  );

  const getQuestionThatCanBeParentList = useCallback(
    (
      programId: d.ProgramId,
      questionId: d.QuestionId
    ): ReadonlyArray<d.Question> => {
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

  const getClassAndRole = useCallback(
    (classId: d.ClassId): ClassAndRole => {
      if (logInState.tag !== "LoggedIn") {
        return { tag: "none" };
      }
      return loggedInStateGetClassAndRole(logInState.loggedInState, classId);
    },
    [logInState]
  );

  const setClassParticipantList = useCallback(
    (
      classId: d.ClassId,
      participantList: ReadonlyArray<d.Participant>
    ): void => {
      setLogInState((beforeLogInState) => {
        if (beforeLogInState.tag !== "LoggedIn") {
          return beforeLogInState;
        }
        return {
          ...beforeLogInState,
          loggedInState: loggedInStateSetClassParticipantList(
            beforeLogInState.loggedInState,
            classId,
            participantList
          ),
        };
      });
    },
    []
  );

  const setStudentQuestionTree = useCallback(
    (
      classId: d.ClassId,
      tree: ReadonlyArray<d.StudentSelfQuestionTree>
    ): void => {
      setLogInState((beforeLogInState) => {
        if (beforeLogInState.tag !== "LoggedIn") {
          return beforeLogInState;
        }
        return {
          ...beforeLogInState,
          loggedInState: loggedInStateSetQuestionTree(
            beforeLogInState.loggedInState,
            classId,
            tree
          ),
        };
      });
    },
    []
  );

  const getStudentQuestionTree: logInStateResult["getStudentQuestionTree"] =
    useCallback(
      (classId) => {
        if (logInState.tag !== "LoggedIn") {
          return undefined;
        }
        const joinedClass =
          logInState.loggedInState.joinedClassMap.get(classId);
        if (joinedClass === undefined) {
          return undefined;
        }
        return joinedClass.questionTreeList;
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
      addCreatedOrEditedQuestion,
      getQuestionById,
      getQuestionDirectChildren,
      getParentQuestionList,
      getQuestionTreeListWithLoadingStateInProgram,
      getQuestionThatCanBeParentList,
      getClassAndRole,
      setClassParticipantList,
      setStudentQuestionTree,
      getStudentQuestionTree,
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
      addCreatedOrEditedQuestion,
      getQuestionById,
      getQuestionDirectChildren,
      getParentQuestionList,
      getQuestionTreeListWithLoadingStateInProgram,
      getQuestionThatCanBeParentList,
      getClassAndRole,
      setClassParticipantList,
      setStudentQuestionTree,
      getStudentQuestionTree,
    ]
  );
};
