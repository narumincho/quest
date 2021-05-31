import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import { QuestionTree, useQuestionMap } from "./state/question";
import { VariantType, useSnackbar } from "notistack";
import { mapSet, mapUpdate } from "../common/map";
import { useEffect, useState } from "react";
import { api } from "./api";
import { stringToValidProgramName } from "../common/validation";
import { useAccountMap } from "./state/account";
import { useClassMap } from "./state/class";

export type QuestionListIdState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Error";
    }
  | {
      tag: "Loaded";
      questionIdList: ReadonlyArray<d.QQuestionId>;
    };

export type ClassIdListState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Error";
    }
  | {
      tag: "Loaded";
      classIdList: ReadonlyArray<d.QClassId>;
    };

export type ProgramWithQuestionIdListAndClassIdList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly questionIdListState: QuestionListIdState;
  readonly classIdListState: ClassIdListState;
};

export type { QuestionTree };

export type AppState = {
  /** ログイン状態 */
  loginState: LoginState;
  /** 現在のページの場所 */
  location: d.QLocation;
  /** プログラムの情報を得る */
  program: (
    id: d.QProgramId
  ) => ProgramWithQuestionIdListAndClassIdList | undefined;
  /** アカウントの情報を得る */
  account: (id: d.AccountId) => d.QAccount | undefined;
  /** 質問を取得する */
  question: (id: d.QQuestionId) => d.QQuestion | undefined;
  /** 質問を作成中かどうか */
  isCreatingQuestion: boolean;
  /** 質問の子を取得する */
  questionChildren: (id: d.QQuestionId) => ReadonlyArray<d.QQuestionId>;

  /** ログインページを取得して移動させる */
  requestLogin: () => void;
  /** ログアウトする */
  logout: () => void;
  /** 指定したページへ移動する */
  jump: (newLocation: d.QLocation) => void;
  /** 指定したページへ推移するが, 今いたページの履歴を置き換える */
  changeLocation: (newLocation: d.QLocation) => void;
  /** ページ推移を戻る */
  back: () => void;
  /** 通知を表示する */
  addNotification: (message: string, variant: VariantType) => void;
  /** プログラムを作成する */
  createProgram: (programName: string) => void;
  /** クラスを作成する */
  createClass: (option: { className: string; programId: d.QProgramId }) => void;
  /** プログラムに属する質問を取得する */
  requestGetQuestionListInProgram: (programId: d.QProgramId) => void;
  /** プログラムに属するクラスを取得する */
  requestGetClassListInProgram: (programId: d.QProgramId) => void;
  /** 質問を作成する */
  createQuestion: (
    programId: d.QProgramId,
    parent: d.QQuestionId | undefined,
    text: string
  ) => void;
  /** 質問の親を取得する. 最初が近い順 */
  questionParentList: (
    id: d.Maybe<d.QQuestionId>
  ) => ReadonlyArray<d.QQuestion>;
  /** 質問の木構造を取得する */
  questionTree: (id: d.QProgramId) => ReadonlyArray<QuestionTree>;
  /** クラスを取得する */
  getClass: (id: d.QClassId) => d.QClass | undefined;
  /** 招待URLをシェアする */
  shareClassInviteLink: (classId: d.QClassId) => void;
  /** 質問を編集する */
  editQuestion: (
    questionId: d.QQuestionId,
    name: string,
    parentId: d.Maybe<d.QQuestionId>
  ) => void;
  /** 親の質問になることができる質問を, キャッシュから取得する */
  getQuestionThatCanBeParentList: (
    programId: d.QProgramId,
    questionId: d.QQuestionId
  ) => ReadonlyArray<d.QQuestion>;
  /** クラスに参加する */
  joinClass: (classInvitationToken: d.QClassInvitationToken) => void;
};

export type LoginState =
  | { tag: "Loading" }
  | {
      tag: "NoLogin";
    }
  | {
      tag: "VerifyingAccountToken";
      accountToken: d.AccountToken;
    }
  | {
      tag: "LoggedIn";
      loggedInState: LoggedInState;
    }
  | {
      tag: "RequestingLoginUrl";
    }
  | {
      tag: "JumpingPage";
    };

export type LoggedInState = {
  accountToken: d.AccountToken;
  account: d.QAccount;
  createdProgramList: ReadonlyMap<
    d.QProgramId,
    ProgramWithQuestionIdListAndClassIdList
  >;
  createdClassList: ReadonlyMap<d.QClassId, d.QClass>;
  joinedClassList: ReadonlyArray<d.Tuple2<d.QClassStudentOrGuest, d.QRole>>;
};

const getAccountTokenFromUrlOrIndexedDb = (
  urlData: commonUrl.UrlData
): Promise<d.AccountToken | undefined> => {
  if (urlData.accountToken !== undefined) {
    return Promise.resolve(urlData.accountToken);
  }
  return indexedDb.getAccountToken();
};

export const useAppState = (): AppState => {
  const { enqueueSnackbar } = useSnackbar();
  const [loginState, setLoginState] = useState<LoginState>({
    tag: "Loading",
  });
  const [location, setLocation] = useState<d.QLocation>(d.QLocation.Top);
  const useClassMapResult = useClassMap();
  const useAccountMapResult = useAccountMap();
  const questionState = useQuestionMap();
  const [isCreatingQuestion, setIsCreatingQuestion] = useState<boolean>(false);

  useEffect(() => {
    // ブラウザで戻るボタンを押したときのイベントを登録
    window.addEventListener("popstate", () => {
      setLocation(
        commonUrl.urlToUrlData(new URL(window.location.href)).location
      );
    });

    const urlData = commonUrl.urlToUrlData(new URL(window.location.href));
    setLocation(urlData.location);
    getAccountTokenFromUrlOrIndexedDb(urlData).then((accountToken) => {
      if (accountToken === undefined) {
        setLoginState({ tag: "NoLogin" });
        return;
      }
      indexedDb.setAccountToken(accountToken);
      setLoginState({
        tag: "VerifyingAccountToken",
        accountToken,
      });
      history.replaceState(
        undefined,
        "",
        commonUrl.locationToUrl(urlData.location).toString()
      );
      api.getAccountData(accountToken).then((response) => {
        if (response._ === "Error") {
          enqueueSnackbar(`ログインに失敗しました ${response.error}`, {
            variant: "error",
          });
          setLoginState({ tag: "NoLogin" });
          indexedDb.deleteAccountToken();
          return;
        }
        setLoginState({
          tag: "LoggedIn",
          loggedInState: {
            accountToken,
            account: response.ok.account,
            createdProgramList: new Map(
              response.ok.createdProgramList.map((program): [
                d.QProgramId,
                ProgramWithQuestionIdListAndClassIdList
              ] => [
                program.id,
                {
                  id: program.id,
                  createAccountId: program.createAccountId,
                  classIdListState: { tag: "None" },
                  name: program.name,
                  questionIdListState: { tag: "None" },
                },
              ])
            ),
            createdClassList: new Map(
              response.ok.createdClassList.map((qClass): [
                d.QClassId,
                d.QClass
              ] => [qClass.id, qClass])
            ),
            joinedClassList: response.ok.joinedClassList,
          },
        });
        useAccountMapResult.set(response.ok.account);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAccountToken = (): d.AccountToken | undefined => {
    switch (loginState.tag) {
      case "LoggedIn":
        return loginState.loggedInState.accountToken;
    }
    return undefined;
  };

  const jump = (newLocation: d.QLocation): void => {
    window.history.pushState(
      undefined,
      "",
      commonUrl
        .urlDataToUrl({
          location: newLocation,
          accountToken: undefined,
        })
        .toString()
    );
    setLocation(newLocation);
  };

  const requestLogin = () => {
    setLoginState({
      tag: "RequestingLoginUrl",
    });
    api.requestLineLoginUrl(undefined).then((response) => {
      if (response._ === "Error") {
        enqueueSnackbar(
          `LINEログインのURLを発行できませんでした ${response.error}`,
          { variant: "error" }
        );
        return;
      }
      setLoginState({ tag: "JumpingPage" });
      requestAnimationFrame(() => {
        window.location.href = response.ok;
      });
    });
  };

  const changeLocation = (newLocation: d.QLocation): void => {
    window.history.replaceState(
      undefined,
      "",
      commonUrl
        .urlDataToUrl({
          location: newLocation,
          accountToken: undefined,
        })
        .toString()
    );
    setLocation(newLocation);
  };

  /** 自分のプログラムを編集した分を変数キャッシュに保存する */
  const setProgram = (program: d.QProgram): void => {
    if (loginState.tag !== "LoggedIn") {
      return;
    }
    setLoginState({
      ...loginState,
      loggedInState: {
        ...loginState.loggedInState,
        createdProgramList: mapSet(
          loginState.loggedInState.createdProgramList,
          program.id,
          {
            id: program.id,
            questionIdListState: { tag: "None" },
            classIdListState: { tag: "None" },
            createAccountId: program.createAccountId,
            name: program.name,
          }
        ),
      },
    });
  };

  const setQuestionListIdStateInProgram = (
    programId: d.QProgramId,
    questionListIdState: QuestionListIdState
  ): void => {
    if (loginState.tag !== "LoggedIn") {
      return;
    }
    setLoginState({
      ...loginState,
      loggedInState: {
        ...loginState.loggedInState,
        createdProgramList: mapUpdate(
          loginState.loggedInState.createdProgramList,
          programId,
          (programWithQuestionIdListAndClassIdList) => ({
            ...programWithQuestionIdListAndClassIdList,
            questionIdList: questionListIdState,
          })
        ),
      },
    });
  };

  const setClassIdListStateInProgram = (
    programId: d.QProgramId,
    classIdListState: ClassIdListState
  ): void => {
    if (loginState.tag !== "LoggedIn") {
      return;
    }
    setLoginState({
      ...loginState,
      loggedInState: {
        ...loginState.loggedInState,
        createdProgramList: mapUpdate(
          loginState.loggedInState.createdProgramList,
          programId,
          (programWithQuestionIdListAndClassIdList) => ({
            ...programWithQuestionIdListAndClassIdList,
            classIdList: classIdListState,
          })
        ),
      },
    });
  };

  return {
    loginState,
    requestLogin,
    logout: (): void => {
      enqueueSnackbar(`ログアウトしました`, {
        variant: "success",
      });
      indexedDb.deleteAccountToken();
      useAccountMapResult.deleteAll();
      useClassMapResult.deleteAll();
      questionState.deleteAll();
      setLoginState({
        tag: "NoLogin",
      });
    },
    location,
    jump,
    changeLocation,
    back,
    isCreatingQuestion,
    addNotification: (text, variant) => {
      enqueueSnackbar(text, { variant });
    },
    createProgram: (programName) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(`プログラムの作成にはログインが必要です`, {
          variant: "error",
        });
        return;
      }
      const projectNameResult = stringToValidProgramName(programName);
      if (projectNameResult._ === "Error") {
        return;
      }
      api
        .createProgram({
          accountToken,
          programName: projectNameResult.ok,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(`プログラム作成に失敗しました ${response.error}`, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar(`プログラム 「${response.ok.name}」を作成しました`, {
            variant: "success",
          });
          setProgram(response.ok);
          changeLocation(d.QLocation.Program(response.ok.id));
        });
    },
    createClass: (option) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(`クラスの作成にはログインが必要です`, {
          variant: "error",
        });
        return;
      }
      api
        .createClass({
          accountToken,
          className: option.className,
          programId: option.programId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(`クラスの作成に失敗しました ${response.error}`, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar(`クラス 「${response.ok.name}」を作成しました`, {
            variant: "success",
          });
          useClassMapResult.setClass(response.ok);
          changeLocation(d.QLocation.Class(response.ok.id));
        });
    },
    program: (
      programId: d.QProgramId
    ): ProgramWithQuestionIdListAndClassIdList | undefined => {
      if (loginState.tag !== "LoggedIn") {
        return;
      }
      return loginState.loggedInState.createdProgramList.get(programId);
    },
    account: useAccountMapResult.getById,
    requestGetQuestionListInProgram: (programId) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(
          `プログラムに属している質問の取得にはログインが必要です`,
          {
            variant: "warning",
          }
        );
        return;
      }
      setQuestionListIdStateInProgram(programId, { tag: "Requesting" });
      api
        .getQuestionInCreatedProgram({
          accountToken,
          programId,
        })
        .then((response) => {
          if (response._ === "Error") {
            setQuestionListIdStateInProgram(programId, { tag: "Error" });
            enqueueSnackbar(
              `プログラムに属している質問の取得に失敗しました ${response.error}`,
              {
                variant: "error",
              }
            );
            return;
          }
          questionState.setQuestionList(response.ok);
          setQuestionListIdStateInProgram(programId, {
            tag: "Loaded",
            questionIdList: response.ok.map((q) => q.id),
          });
        });
    },
    requestGetClassListInProgram: (programId) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(
          `プログラムに属しているクラスの取得にはログインが必要です`,
          {
            variant: "warning",
          }
        );
        return;
      }
      setClassIdListStateInProgram(programId, { tag: "Requesting" });
      api
        .getClassListInProgram({
          programId,
          accountToken,
        })
        .then((response) => {
          if (response._ === "Error") {
            setClassIdListStateInProgram(programId, { tag: "Error" });
            enqueueSnackbar(
              `プログラムに属しているクラスの取得にに失敗しました ${response.error}`,
              {
                variant: "error",
              }
            );
            return;
          }
          useClassMapResult.setClassList(response.ok);
          setClassIdListStateInProgram(programId, {
            tag: "Loaded",
            classIdList: response.ok.map((c) => c.id),
          });
        });
    },
    createQuestion: (programId, parent, questionText) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        return;
      }
      setIsCreatingQuestion(true);
      api
        .createQuestion({
          accountToken,
          programId,
          parent:
            parent === undefined ? d.Maybe.Nothing() : d.Maybe.Just(parent),
          questionText,
        })
        .then((response) => {
          setIsCreatingQuestion(false);
          if (response._ === "Error") {
            enqueueSnackbar(`質問の作成に失敗した ${response.error}`, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar(`質問を作成しました`, {
            variant: "success",
          });
          questionState.setQuestion(response.ok);
          setLocation(d.QLocation.Question(response.ok.id));
        });
    },
    question: questionState.questionById,
    questionChildren: questionState.questionChildren,
    questionParentList: (id) => {
      if (id._ === "Nothing") {
        return [];
      }
      return questionState.getParentQuestionList(id.value);
    },
    questionTree: questionState.questionTree,
    getClass: useClassMapResult.getById,
    shareClassInviteLink: (classId) => {
      const qClass = useClassMapResult.getById(classId);
      if (qClass === undefined) {
        return;
      }
      navigator
        .share({
          url: commonUrl
            .locationToUrl(d.QLocation.ClassInvitation(qClass.invitationToken))
            .toString(),
          title: `${qClass.name}の招待リンク`,
        })
        .then((e) => {
          console.log(e);
        });
    },
    editQuestion: (questionId, name, parentId) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        return;
      }
      api
        .editQuestion({
          accountToken,
          questionId,
          name,
          parentId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(`質問の編集に失敗した ${response.error}`, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar(`質問を編集しました`, {
            variant: "success",
          });
          questionState.setQuestion(response.ok);
          setLocation(d.QLocation.Question(response.ok.id));
        });
    },
    getQuestionThatCanBeParentList:
      questionState.getQuestionThatCanBeParentList,
    joinClass: (classInvitationToken) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(`クラスの参加にはログインする必要があります`, {
          variant: "error",
        });
        return;
      }
      api
        .joinClassAsStudent({ accountToken, classInvitationToken })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(`クラスの参加に失敗しました ${response.error}`, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar(`クラスに参加しました`, {
            variant: "success",
          });
          useClassMapResult.setClass(response.ok);
          setLocation(d.QLocation.Class(response.ok.id));
        });
    },
  };
};

const back = (): void => {
  window.history.back();
};
