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
  readonly logInState: LogInState;
  /** 現在のページの場所 */
  readonly location: d.Location;
  /** プログラムの情報を得る */
  readonly program: (id: d.ProgramId) => ProgramWithClassList | undefined;
  /** アカウントの情報を得る */
  readonly account: (id: d.AccountId) => d.Account | undefined;
  /** 質問を取得する */
  readonly question: (id: d.QuestionId) => d.Question | undefined;
  /** 質問を作成中かどうか */
  readonly isCreatingQuestion: boolean;
  /** 質問の子を取得する */
  readonly questionChildren: (id: d.QuestionId) => ReadonlyArray<d.QuestionId>;

  /** ログインページを取得して移動させる */
  readonly requestLogin: () => void;
  /** テストアカウントとしてログインする */
  readonly requestLogInAsTestAccount: () => void;
  /** ログアウトする */
  readonly logout: () => void;
  /** 指定したページへ移動する */
  readonly jump: (newLocation: d.Location) => void;
  /** 指定したページへ推移するが, 今いたページの履歴を置き換える */
  readonly changeLocation: (newLocation: d.Location) => void;
  /** ページ推移を戻る */
  readonly back: () => void;
  /** 通知を表示する */
  readonly addNotification: (message: string, variant: VariantType) => void;
  /** プログラムを作成する */
  readonly createProgram: (programName: string) => void;
  /** クラスを作成する */
  readonly createClass: (option: {
    className: string;
    programId: d.ProgramId;
  }) => void;
  /** プログラムに属する質問を取得する */
  readonly requestGetQuestionListInProgram: (programId: d.ProgramId) => void;
  /** 質問を作成する */
  readonly createQuestion: (
    programId: d.ProgramId,
    parent: d.QuestionId | undefined,
    text: string
  ) => void;
  /** 質問の親を取得する. 最初が近い順 */
  readonly questionParentList: (
    id: d.Option<d.QuestionId>
  ) => ReadonlyArray<d.Question>;
  /** 質問の木構造を取得する */
  readonly getQuestionTreeListWithLoadingStateInProgram: (
    id: d.ProgramId
  ) => QuestionTreeListWithLoadingState;
  /** 作成したクラスまたは, 参加したクラスを習得する */
  readonly getClassAndRole: (id: d.ClassId) => ClassAndRole;
  /** 招待URLをシェアする */
  readonly shareClassInviteLink: (classId: d.ClassId) => void;
  /** 質問を編集する */
  readonly editQuestion: (
    questionId: d.QuestionId,
    name: string,
    parentId: d.Option<d.QuestionId>
  ) => void;
  /** 親の質問になることができる質問を, キャッシュから取得する */
  readonly getQuestionThatCanBeParentList: (
    programId: d.ProgramId,
    questionId: d.QuestionId
  ) => ReadonlyArray<d.Question>;
  /** クラスに参加する */
  readonly joinClass: (
    classInvitationToken: d.StudentClassInvitationToken
  ) => void;
  /** クラスの参加者を取得する */
  readonly requestParticipantListInClass: (classId: d.ClassId) => void;
  /** クラスの質問と自分の答えた回答を取得する */
  readonly requestStudentQuestionTreeInClass: (classId: d.ClassId) => void;
  /** 生徒として参加したクラスの質問と回答状況をキャッシュから取得する */
  readonly getStudentQuestionTree: (
    classId: d.ClassId
  ) => ReadonlyArray<d.StudentSelfQuestionTree> | undefined;
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
    setClassParticipantList,
    setStudentQuestionTree,
    getStudentQuestionTree,
  } = useLogInState();
  const [location, setLocation] = useState<d.Location>(d.Location.Top);
  const useAccountMapResult = useAccountMap();
  const [isCreatingQuestion, setIsCreatingQuestion] = useState<boolean>(false);

  useEffect(() => {
    // ブラウザで戻るボタンを押したときのイベントを登録
    window.addEventListener("popstate", () => {
      const urlData = commonUrl.urlToUrlData(new URL(window.location.href));
      if (urlData._ === "Normal") {
        setLocation(urlData.location);
      }
    });

    const urlData = commonUrl.urlToUrlData(new URL(window.location.href));
    if (urlData._ === "Normal") {
      setLocation(urlData.location);
      indexedDb.getAccountToken().then((accountToken) => {
        if (accountToken === undefined) {
          setNoLogIn();
          return;
        }
        setLogInData({ accountToken, location: urlData.location });
      });
    } else {
      api
        .getAccountTokenAndLocationByCodeAndState(urlData.codeAndState)
        .then((response) => {
          if (response._ === "Ok") {
            if (response.okValue._ === "Some") {
              enqueueSnackbar(`ログインに成功しました`, {
                variant: "success",
              });
              setLogInData(response.okValue.value);
            } else {
              enqueueSnackbar(`ログインに失敗しました`, {
                variant: "error",
              });
            }
          } else {
            enqueueSnackbar(`ログインに失敗しました ${response.errorValue}`, {
              variant: "error",
            });
          }
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLogInData = useCallback(
    async (
      accountTokenAndLocation: d.AccountTokenAndLocation
    ): Promise<void> => {
      indexedDb.setAccountToken(accountTokenAndLocation.accountToken);
      setVerifyingAccountToken(accountTokenAndLocation.accountToken);
      history.replaceState(
        undefined,
        "",
        commonUrl.locationToUrl(accountTokenAndLocation.location).toString()
      );

      const response = await api.getAccountData(
        accountTokenAndLocation.accountToken
      );
      if (response._ === "Error") {
        enqueueSnackbar(`ログインに失敗しました ${response.errorValue}`, {
          variant: "error",
        });
        setNoLogIn();
        indexedDb.deleteAccountToken();
        return;
      }
      setLoggedIn(response.okValue, accountTokenAndLocation.accountToken);
      setLocation(accountTokenAndLocation.location);
      useAccountMapResult.set(response.okValue.account);
    },
    [
      enqueueSnackbar,
      setLoggedIn,
      setNoLogIn,
      setVerifyingAccountToken,
      useAccountMapResult,
    ]
  );

  const getAccountToken = useCallback((): d.AccountToken | undefined => {
    switch (logInState.tag) {
      case "LoggedIn":
        return logInState.loggedInState.accountToken;
    }
    return undefined;
  }, [logInState]);

  const jump = useCallback((newLocation: d.Location): void => {
    window.history.pushState(
      undefined,
      "",
      commonUrl.locationToUrl(newLocation).toString()
    );
    setLocation(newLocation);
  }, []);

  const requestLogin = useCallback(() => {
    setRequestingLogInUrl();
    api.requestLineLoginUrl(location).then((response) => {
      if (response._ === "Error") {
        enqueueSnackbar(
          `LINEログインのURLを発行できませんでした ${response.errorValue}`,
          { variant: "error" }
        );
        return;
      }
      setJumpingPage();
      requestAnimationFrame(() => {
        window.location.href = response.okValue;
      });
    });
  }, [enqueueSnackbar, location, setJumpingPage, setRequestingLogInUrl]);

  const changeLocation = useCallback((newLocation: d.Location): void => {
    window.history.replaceState(
      undefined,
      "",
      commonUrl.locationToUrl(newLocation).toString()
    );
    setLocation(newLocation);
  }, []);

  const getCreatedClass = useCallback(
    (qClassId: d.ClassId): d.AdminClass | undefined => {
      if (logInState.tag !== "LoggedIn") {
        return;
      }
      for (const program of logInState.loggedInState.createdProgramMap.values()) {
        for (const classWithParticipantList of program.classList) {
          if (classWithParticipantList.qClass.id === qClassId) {
            return classWithParticipantList.qClass;
          }
        }
      }
    },
    [logInState]
  );

  const requestParticipantListInClass = useCallback(
    (classId: d.ClassId): void => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(`クラスのの参加者の取得にはログインが必要です`, {
          variant: "warning",
        });
        return;
      }
      api
        .getClassParticipant({
          accountToken,
          classId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(
              `クラスの参加者取得中にエラーが発生しました ${response.errorValue}`,
              {
                variant: "warning",
              }
            );
            return;
          }
          enqueueSnackbar("クラスの参加者取得に成功しました", {
            variant: "success",
          });
          console.log("取得した", response.okValue);
          setClassParticipantList(classId, response.okValue);
        });
    },
    [enqueueSnackbar, getAccountToken, setClassParticipantList]
  );

  const getStudentQuestionTreeInClass = useCallback(
    (classId: d.ClassId): void => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        enqueueSnackbar(`クラスの質問と回答状況の取得にはログインが必要です`, {
          variant: "warning",
        });
        return;
      }
      api
        .getStudentQuestionTreeInClass({
          accountToken,
          classId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(
              `クラスの質問と回答状況の取得にエラーが発生しました ${response.errorValue}`,
              {
                variant: "warning",
              }
            );
            return;
          }
          enqueueSnackbar("クラスの質問と回答状況の取得に成功しました", {
            variant: "success",
          });
          setStudentQuestionTree(classId, response.okValue);
        });
    },
    [enqueueSnackbar, getAccountToken, setStudentQuestionTree]
  );

  return useMemo<AppState>(
    () => ({
      logInState,
      requestLogin,
      requestLogInAsTestAccount: (): void => {
        setLogInData({
          accountToken: d.AccountToken.fromString(
            "a5b7058a6c75fe48875a8591abe7a49f82f5c3aaf52614f4fbc971ae9db1c91b"
          ),
          location: d.Location.Top,
        });
      },
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
            programName: projectNameResult.okValue,
          })
          .then((response) => {
            if (response._ === "Error") {
              enqueueSnackbar(
                `プログラム作成に失敗しました ${response.errorValue}`,
                {
                  variant: "error",
                }
              );
              return;
            }
            enqueueSnackbar(
              `プログラム 「${response.okValue.name}」を作成しました`,
              {
                variant: "success",
              }
            );
            setProgram(response.okValue);
            changeLocation(d.Location.Program(response.okValue.id));
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
              enqueueSnackbar(
                `クラスの作成に失敗しました ${response.errorValue}`,
                {
                  variant: "error",
                }
              );
              return;
            }
            enqueueSnackbar(
              `クラス 「${response.okValue.name}」を作成しました`,
              {
                variant: "success",
              }
            );
            addCreatedClass(response.okValue);
            changeLocation(d.Location.Class(response.okValue.id));
          });
      },
      program: (programId: d.ProgramId): ProgramWithClassList | undefined => {
        if (logInState.tag !== "LoggedIn") {
          return;
        }
        return logInState.loggedInState.createdProgramMap.get(programId);
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
                `プログラムに属している質問の取得に失敗しました ${response.errorValue}`,
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
                response.okValue.map((q): [d.QuestionId, d.Question] => [
                  q.id,
                  q,
                ])
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
              parent === undefined ? d.Option.None() : d.Option.Some(parent),
            questionText,
          })
          .then((response) => {
            setIsCreatingQuestion(false);
            if (response._ === "Error") {
              enqueueSnackbar(`質問の作成に失敗した ${response.errorValue}`, {
                variant: "error",
              });
              return;
            }
            enqueueSnackbar(`質問を作成しました`, {
              variant: "success",
            });
            addCreatedOrEditedQuestion(response.okValue);
            setLocation(
              d.Location.AdminQuestion({
                questionId: response.okValue.id,
                programId: response.okValue.programId,
              })
            );
          });
      },
      question: getQuestionById,
      questionChildren: getQuestionDirectChildren,
      questionParentList: (id) => {
        if (id._ === "None") {
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
                d.Location.ClassInvitation(qClass.studentInvitationToken)
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
              enqueueSnackbar(`質問の編集に失敗した ${response.errorValue}`, {
                variant: "error",
              });
              return;
            }
            enqueueSnackbar(`質問を編集しました`, {
              variant: "success",
            });
            addCreatedOrEditedQuestion(response.okValue);
            setLocation(
              d.Location.AdminQuestion({
                questionId: response.okValue.id,
                programId: response.okValue.programId,
              })
            );
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
              enqueueSnackbar(
                `クラスの参加に失敗しました ${response.errorValue}`,
                {
                  variant: "error",
                }
              );
              return;
            }
            enqueueSnackbar(`クラスに参加しました`, {
              variant: "success",
            });
            addJoinedClass(response.okValue, d.ClassParticipantRole.Student);
            setLocation(d.Location.Class(response.okValue.id));
          });
      },
      requestParticipantListInClass,
      requestStudentQuestionTreeInClass: getStudentQuestionTreeInClass,
      getStudentQuestionTree,
    }),
    [
      logInState,
      requestLogin,
      location,
      jump,
      changeLocation,
      isCreatingQuestion,
      useAccountMapResult,
      getQuestionById,
      getQuestionDirectChildren,
      getQuestionTreeListWithLoadingStateInProgram,
      getQuestionThatCanBeParentList,
      requestParticipantListInClass,
      setLogInData,
      enqueueSnackbar,
      setNoLogIn,
      getAccountToken,
      setProgram,
      addCreatedClass,
      setQuestionListState,
      addCreatedOrEditedQuestion,
      getParentQuestionList,
      getClassAndRole,
      getCreatedClass,
      addJoinedClass,
      getStudentQuestionTreeInClass,
      getStudentQuestionTree,
    ]
  );
};

const back = (): void => {
  window.history.back();
};
