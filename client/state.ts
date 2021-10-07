import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import {
  ClassAndRole,
  QuestionTreeListWithLoadingState,
  addCreatedClass,
  addCreatedOrEditedQuestion,
  addJoinedClass,
  setClassParticipantList,
  setConfirmedAnswerList,
  setProgram,
  setQuestionListState,
  setStudentQuestionTree,
} from "./state/loggedInState";
import {
  LogInState,
  getClassAndRole,
  getParentQuestionList,
  getQuestionById,
  getQuestionDirectChildren,
  getQuestionThatCanBeParentList,
  getQuestionTreeListWithLoadingStateInProgram,
  getStudentQuestionTree,
  loggedIn,
  updateLoggedInState,
} from "./state/logInState";
import { VariantType, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { api } from "./api";
import { stringToValidProgramName } from "../common/validation";
import { useAccountMap } from "./state/account";

export type AppState = {
  /** ログイン状態 */
  readonly logInState: LogInState;
  /** 現在のページの場所 */
  readonly location: d.Location;
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
  readonly requestLogInAsTestAccount: (accountToken: d.AccountToken) => void;
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
  /** 生徒が質問に回答する */
  readonly answerQuestion: (option: {
    readonly answerText: string;
    readonly classId: d.ClassId;
    readonly questionId: d.QuestionId;
    readonly isConfirm: boolean;
  }) => void;
  /** クラス作成者が生徒の回答を取得する */
  readonly requestStudentConfirmedAnswerList: (option: {
    readonly classId: d.ClassId;
    readonly studentAccountId: d.AccountId;
    readonly accountToken: d.AccountToken;
  }) => void;
  /** 他の生徒の回答を取得する */
  readonly requestAnswersFromOtherStudents: (option: {
    readonly classId: d.ClassId;
    readonly questionId: d.QuestionId;
    readonly accountToken: d.AccountToken;
  }) => Promise<ReadonlyArray<d.AnswersFromOtherStudent> | undefined>;
  /** コメントを取得する */
  readonly requestFeedback: (
    option: d.GetFeedbackParameter
  ) => Promise<ReadonlyArray<d.Feedback> | undefined>;
  readonly addFeedback: (
    option: d.AddFeedbackParameter
  ) => Promise<ReadonlyArray<d.Feedback> | undefined>;
};

export const useAppState = (): AppState => {
  const { enqueueSnackbar } = useSnackbar();
  const [logInState, setLogInState] = useState<LogInState>({ tag: "Loading" });
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
          setLogInState({ tag: "NoLogin" });
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

  const setLogInData = async (
    accountTokenAndLocation: d.AccountTokenAndLocation
  ): Promise<void> => {
    indexedDb.setAccountToken(accountTokenAndLocation.accountToken);
    setLogInState({
      tag: "VerifyingAccountToken",
      accountToken: accountTokenAndLocation.accountToken,
    });
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
      setLogInState({ tag: "NoLogin" });
      indexedDb.deleteAccountToken();
      return;
    }
    setLogInState(
      loggedIn(response.okValue, accountTokenAndLocation.accountToken)
    );
    setLocation(accountTokenAndLocation.location);
    useAccountMapResult.set(response.okValue.account);
  };

  const getAccountToken = (): d.AccountToken | undefined => {
    switch (logInState.tag) {
      case "LoggedIn":
        return logInState.loggedInState.accountToken;
    }
    return undefined;
  };

  const jump = (newLocation: d.Location): void => {
    window.history.pushState(
      undefined,
      "",
      commonUrl.locationToUrl(newLocation).toString()
    );
    setLocation(newLocation);
  };

  const requestLogin = () => {
    setLogInState({ tag: "RequestingLogInUrl" });
    api.requestLineLoginUrl(location).then((response) => {
      if (response._ === "Error") {
        enqueueSnackbar(
          `LINEログインのURLを発行できませんでした ${response.errorValue}`,
          { variant: "error" }
        );
        return;
      }
      setLogInState({ tag: "JumpingPage" });
      requestAnimationFrame(() => {
        window.location.href = response.okValue;
      });
    });
  };

  const changeLocation = (newLocation: d.Location): void => {
    window.history.replaceState(
      undefined,
      "",
      commonUrl.locationToUrl(newLocation).toString()
    );
    setLocation(newLocation);
  };

  const getCreatedClass = (qClassId: d.ClassId): d.AdminClass | undefined => {
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
  };

  const requestParticipantListInClass = (classId: d.ClassId): void => {
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
        setLogInState(
          updateLoggedInState((beforeLogInState) =>
            setClassParticipantList(beforeLogInState, classId, response.okValue)
          )
        );
      });
  };

  const getStudentQuestionTreeInClass = (classId: d.ClassId): void => {
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
        setLogInState(
          updateLoggedInState((beforeLogInState) =>
            setStudentQuestionTree(beforeLogInState, classId, response.okValue)
          )
        );
      });
  };

  const answerQuestion: AppState["answerQuestion"] = (parameter) => {
    const accountToken = getAccountToken();
    if (accountToken === undefined) {
      enqueueSnackbar(`質問への回答にはログインが必要です`, {
        variant: "warning",
      });
      return;
    }
    api
      .answerQuestion({
        accountToken,
        answerText: parameter.answerText,
        classId: parameter.classId,
        isConfirm: parameter.isConfirm,
        questionId: parameter.questionId,
      })
      .then((response) => {
        if (response._ === "Error") {
          enqueueSnackbar(
            `質問への回答にエラーが発生しました ${response.errorValue}`,
            {
              variant: "warning",
            }
          );
          return;
        }
        enqueueSnackbar("質問への回答に成功しました", {
          variant: "success",
        });
        setLogInState(
          updateLoggedInState((beforeLogInState) =>
            setStudentQuestionTree(
              beforeLogInState,
              parameter.classId,
              response.okValue
            )
          )
        );
        setLocation(d.Location.Class(parameter.classId));
      });
  };

  return {
    logInState,
    requestLogin,
    requestLogInAsTestAccount: (accountToken: d.AccountToken): void => {
      setLogInData({
        accountToken,
        location: d.Location.Top,
      });
    },
    logout: (): void => {
      enqueueSnackbar(`ログアウトしました`, {
        variant: "success",
      });
      indexedDb.deleteAccountToken();
      useAccountMapResult.deleteAll();
      setLogInState({ tag: "NoLogin" });
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
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              setProgram(beforeLogInState, response.okValue)
            )
          );
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
          enqueueSnackbar(`クラス 「${response.okValue.name}」を作成しました`, {
            variant: "success",
          });
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              addCreatedClass(beforeLogInState, response.okValue)
            )
          );
          changeLocation(d.Location.Class(response.okValue.id));
        });
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
      setLogInState(
        updateLoggedInState((beforeLogInState) =>
          setQuestionListState(beforeLogInState, {
            programId,
            questionListState: {
              tag: "Requesting",
            },
          })
        )
      );
      api
        .getQuestionInCreatedProgram({
          accountToken,
          programId,
        })
        .then((response) => {
          if (response._ === "Error") {
            setLogInState(
              updateLoggedInState((beforeLogInState) =>
                setQuestionListState(beforeLogInState, {
                  programId,
                  questionListState: {
                    tag: "Error",
                  },
                })
              )
            );

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
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              setQuestionListState(beforeLogInState, {
                programId,
                questionListState: {
                  tag: "Loaded",
                  questionMap: new Map(
                    response.okValue.map((q): [d.QuestionId, d.Question] => [
                      q.id,
                      q,
                    ])
                  ),
                },
              })
            )
          );
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
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              addCreatedOrEditedQuestion(beforeLogInState, response.okValue)
            )
          );
          setLocation(
            d.Location.AdminQuestion({
              questionId: response.okValue.id,
              programId: response.okValue.programId,
            })
          );
        });
    },
    question: (questionId: d.QuestionId) =>
      getQuestionById(logInState, questionId),
    questionChildren: (questionId: d.QuestionId) =>
      getQuestionDirectChildren(logInState, questionId),
    questionParentList: (id) => {
      if (id._ === "None") {
        return [];
      }
      return getParentQuestionList(logInState, id.value);
    },
    getQuestionTreeListWithLoadingStateInProgram: (programId: d.ProgramId) =>
      getQuestionTreeListWithLoadingStateInProgram(logInState, programId),
    getClassAndRole: (classId) => {
      return getClassAndRole(logInState, classId);
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
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              addCreatedOrEditedQuestion(beforeLogInState, response.okValue)
            )
          );
          setLocation(
            d.Location.AdminQuestion({
              questionId: response.okValue.id,
              programId: response.okValue.programId,
            })
          );
        });
    },
    getQuestionThatCanBeParentList: (
      programId: d.ProgramId,
      questionId: d.QuestionId
    ) => getQuestionThatCanBeParentList(logInState, programId, questionId),
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
          setLogInState(
            updateLoggedInState((beforeLogInState) =>
              addJoinedClass(beforeLogInState, response.okValue)
            )
          );
          changeLocation(d.Location.Class(response.okValue.id));
        });
    },
    requestParticipantListInClass,
    requestStudentQuestionTreeInClass: getStudentQuestionTreeInClass,
    getStudentQuestionTree: (classId: d.ClassId) =>
      getStudentQuestionTree(logInState, classId),
    answerQuestion,
    requestStudentConfirmedAnswerList: (option) => {
      api
        .getStudentConfirmedAnswerList({
          accountToken: option.accountToken,
          classId: option.classId,
          studentAccountId: option.studentAccountId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(
              `生徒の回答の取得に失敗しました ${response.errorValue}`,
              {
                variant: "error",
              }
            );
            return;
          }
          enqueueSnackbar(`生徒の回答の取得に成功しました`, {
            variant: "success",
          });
          setLogInState(
            updateLoggedInState((beforeLoggedInState) =>
              setConfirmedAnswerList(
                beforeLoggedInState,
                option.classId,
                option.studentAccountId,
                response.okValue
              )
            )
          );
        });
    },
    requestAnswersFromOtherStudents: async (
      parameter
    ): Promise<ReadonlyArray<d.AnswersFromOtherStudent> | undefined> => {
      const response = await api.getAnswersFromOtherStudents(parameter);
      if (response._ === "Error") {
        enqueueSnackbar(`他の生徒の回答の取得に失敗しました`, {
          variant: "error",
        });
        return undefined;
      }
      return response.okValue;
    },
    requestFeedback: async (parameter) => {
      const response = await api.getFeedback(parameter);
      if (response._ === "Error") {
        enqueueSnackbar(`コメントの取得に失敗しました`, {
          variant: "error",
        });
        return undefined;
      }
      return response.okValue;
    },
    addFeedback: async (parameter) => {
      const response = await api.addFeedback(parameter);
      if (response._ === "Error") {
        enqueueSnackbar(`コメントの送信に失敗しました`, {
          variant: "error",
        });
        return undefined;
      }
      return response.okValue;
    },
  };
};

const back = (): void => {
  window.history.back();
};
