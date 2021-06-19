import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import {
  ClassAndRole,
  LogInState,
  LoggedInState,
  ProgramWithClassList,
  QuestionListState,
  QuestionTreeListWithLoadingState,
  useLogInState,
} from "./state/logInState";
import { VariantType, useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QuestionTree } from "./state/question";
import { api } from "./api";
import { stringToValidProgramName } from "../common/validation";
import { useAccountMap } from "./state/account";

export type {
  QuestionTree,
  LoggedInState,
  ProgramWithClassList,
  QuestionListState,
  QuestionTreeListWithLoadingState,
};

export type AppState = {
  /** ログイン状態 */
  logInState: LogInState;
  /** 現在のページの場所 */
  location: d.QLocation;
  /** プログラムの情報を得る */
  program: (id: d.QProgramId) => ProgramWithClassList | undefined;
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
  getQuestionTreeListWithLoadingStateInProgram: (
    id: d.QProgramId
  ) => QuestionTreeListWithLoadingState;
  /** 作成したクラスまたは, 参加したクラスを習得する */
  getClassAndRole: (id: d.QClassId) => ClassAndRole;
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
  /** 質問IDからプロジェクトに属する質問を取得する */
  getQuestionInProgramByQuestionId: (questionId: d.QQuestionId) => void;
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
  const {
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
  } = useLogInState();
  const [location, setLocation] = useState<d.QLocation>(d.QLocation.Top);
  const useAccountMapResult = useAccountMap();
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
        setNoLogIn();
        return;
      }
      indexedDb.setAccountToken(accountToken);
      setVerifyingAccountToken(accountToken);
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
          setNoLogIn();
          indexedDb.deleteAccountToken();
          return;
        }
        setLoggedIn(response.ok, accountToken);
        useAccountMapResult.set(response.ok.account);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAccountToken = useCallback((): d.AccountToken | undefined => {
    switch (logInState.tag) {
      case "LoggedIn":
        return logInState.loggedInState.accountToken;
    }
    return undefined;
  }, [logInState]);

  const jump = useCallback((newLocation: d.QLocation): void => {
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
  }, []);

  const requestLogin = useCallback(() => {
    setRequestingLogInUrl();
    api.requestLineLoginUrl(undefined).then((response) => {
      if (response._ === "Error") {
        enqueueSnackbar(
          `LINEログインのURLを発行できませんでした ${response.error}`,
          { variant: "error" }
        );
        return;
      }
      setJumpingPage();
      requestAnimationFrame(() => {
        window.location.href = response.ok;
      });
    });
  }, [enqueueSnackbar, setJumpingPage, setRequestingLogInUrl]);

  const changeLocation = useCallback((newLocation: d.QLocation): void => {
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
  }, []);

  const getCreatedClass = useCallback(
    (qClassId: d.QClassId): d.QClass | undefined => {
      if (logInState.tag !== "LoggedIn") {
        return;
      }
      for (const program of logInState.loggedInState.createdProgramList.values()) {
        for (const classWithParticipantList of program.classList) {
          if (classWithParticipantList.qClass.id === qClassId) {
            return classWithParticipantList.qClass;
          }
        }
      }
    },
    [logInState]
  );

  return useMemo<AppState>(
    () => ({
      logInState,
      requestLogin,
      logout: (): void => {
        enqueueSnackbar(`ログアウトしました`, {
          variant: "success",
        });
        indexedDb.deleteAccountToken();
        useAccountMapResult.deleteAll();
        setNoLogIn();
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
              enqueueSnackbar(
                `プログラム作成に失敗しました ${response.error}`,
                {
                  variant: "error",
                }
              );
              return;
            }
            enqueueSnackbar(
              `プログラム 「${response.ok.name}」を作成しました`,
              {
                variant: "success",
              }
            );
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
            addCreatedClass(response.ok);
            changeLocation(d.QLocation.Class(response.ok.id));
          });
      },
      program: (programId: d.QProgramId): ProgramWithClassList | undefined => {
        if (logInState.tag !== "LoggedIn") {
          return;
        }
        return logInState.loggedInState.createdProgramList.get(programId);
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
        setQuestionListState(programId, { tag: "Requesting" });
        api
          .getQuestionInCreatedProgram({
            accountToken,
            programId,
          })
          .then((response) => {
            if (response._ === "Error") {
              setQuestionListState(programId, { tag: "Error" });
              enqueueSnackbar(
                `プログラムに属している質問の取得に失敗しました ${response.error}`,
                {
                  variant: "error",
                }
              );
              return;
            }
            enqueueSnackbar(`プログラムに属している質問の取得に成功しました`, {
              variant: "success",
            });
            setQuestionListState(programId, {
              tag: "Loaded",
              questionMap: new Map(
                response.ok.map((q): [d.QQuestionId, d.QQuestion] => [q.id, q])
              ),
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
            addCreatedOrEditedQuestion(response.ok);
            setLocation(d.QLocation.Question(response.ok.id));
          });
      },
      question: getQuestionById,
      questionChildren: getQuestionDirectChildren,
      questionParentList: (id) => {
        if (id._ === "Nothing") {
          return [];
        }
        return getParentQuestionList(id.value);
      },
      getQuestionTreeListWithLoadingStateInProgram,
      getClassAndRole: (classId) => {
        return getClassAndRole(classId);
      },
      shareClassInviteLink: (classId) => {
        const qClass = getCreatedClass(classId);
        if (qClass === undefined) {
          return;
        }
        navigator
          .share({
            url: commonUrl
              .locationToUrl(
                d.QLocation.ClassInvitation(qClass.invitationToken)
              )
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
            addCreatedOrEditedQuestion(response.ok);
            setLocation(d.QLocation.Question(response.ok.id));
          });
      },
      getQuestionThatCanBeParentList,
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
            addJoinedClass(response.ok, d.QRole.Student);
            setLocation(d.QLocation.Class(response.ok.id));
          });
      },
      getQuestionInProgramByQuestionId: (questionId: d.QQuestionId) => {
        if (getQuestionById(questionId) !== undefined) {
          return;
        }
        const accountToken = getAccountToken();
        if (accountToken === undefined) {
          enqueueSnackbar(`質問の取得にはログインする必要があります`, {
            variant: "error",
          });
          return;
        }
        api
          .getQuestionInProgramByQuestionId({ accountToken, questionId })
          .then((response) => {
            if (response._ === "Error") {
              enqueueSnackbar(`プログラムに属する質問の取得にに失敗しました`, {
                variant: "error",
              });
              return;
            }
            const firstQuestion = response.ok[0];
            if (firstQuestion === undefined) {
              return;
            }
            setQuestionListState(firstQuestion.programId, {
              tag: "Loaded",
              questionMap: new Map(
                response.ok.map((q): [d.QQuestionId, d.QQuestion] => [q.id, q])
              ),
            });
          });
      },
    }),
    [
      addCreatedClass,
      addCreatedOrEditedQuestion,
      addJoinedClass,
      changeLocation,
      enqueueSnackbar,
      getAccountToken,
      getClassAndRole,
      getCreatedClass,
      getParentQuestionList,
      getQuestionById,
      getQuestionDirectChildren,
      getQuestionThatCanBeParentList,
      getQuestionTreeListWithLoadingStateInProgram,
      isCreatingQuestion,
      jump,
      location,
      logInState,
      requestLogin,
      setNoLogIn,
      setProgram,
      setQuestionListState,
      useAccountMapResult,
    ]
  );
};

const back = (): void => {
  window.history.back();
};
