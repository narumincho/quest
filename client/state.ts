import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import { VariantType, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { api } from "./api";
import { stringToValidProjectName } from "../common/validation";

/** 作成したプログラムの取得状態 */
export type CreatedProgramListState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Loaded";
      projectIdList: ReadonlyArray<d.QProgramId>;
    };

export type RequestQuestionListInProgramState =
  | {
      tag: "None";
    }
  | {
      tag: "Requesting";
    }
  | {
      tag: "Loaded";
      questionIdList: ReadonlyArray<d.QQuestionId>;
    };

export type ProgramWithQuestionIdList = {
  readonly id: d.QProgramId;
  readonly name: string;
  readonly createAccountId: d.AccountId;
  readonly questionList: RequestQuestionListInProgramState;
};

export type AppState = {
  /** ログイン状態 */
  loginState: LoginState;
  /** 現在のページの場所 */
  location: d.QLocation;
  /** 作成したプログラムの取得状態 */
  createdProgramListState: CreatedProgramListState;
  /** プログラムの情報を得る */
  program: (id: d.QProgramId) => ProgramWithQuestionIdList | undefined;
  /** アカウントの情報を得る */
  account: (id: d.AccountId) => d.QAccount | undefined;
  /** 質問を取得する */
  question: (id: d.QQuestionId) => d.QQuestion | undefined;
  /** 質問を作成中かどうか */
  isCreatingQuestion: boolean;

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

  /** 作成したプログラムを取得する */
  requestGetCreatedProgram: () => void;
  /** プログラムに属する質問を取得する */
  requestGetQuestionListInProgram: (programId: d.QProgramId) => void;
  /** 質問を作成する */
  createQuestion: (
    programId: d.QProgramId,
    parent: d.QQuestionId | undefined,
    text: string
  ) => void;
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
      accountToken: d.AccountToken;
      account: d.QAccount;
    }
  | {
      tag: "RequestingLoginUrl";
    }
  | {
      tag: "JumpingPage";
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
  const [programMap, setProgramMap] = useState<
    ReadonlyMap<d.QProgramId, ProgramWithQuestionIdList>
  >(new Map());
  const [accountMap, setAccountMap] = useState<
    ReadonlyMap<d.AccountId, d.QAccount>
  >(new Map());
  const [
    createdProgramList,
    setCreatedProgramList,
  ] = useState<CreatedProgramListState>({ tag: "None" });
  const [questionMap, setQuestionMap] = useState<
    ReadonlyMap<d.QQuestionId, d.QQuestion>
  >(new Map());
  const [isCreatingQuestion, setIsCreatingQuestion] = useState<boolean>(false);

  const setProgram = (program: d.QProgram): void => {
    setProgramMap((before) => {
      return new Map(before).set(program.id, {
        id: program.id,
        name: program.id,
        createAccountId: program.createAccountId,
        questionList: { tag: "None" },
      });
    });
  };

  const setProgramList = (programList: ReadonlyArray<d.QProgram>): void => {
    setProgramMap((before) => {
      const map = new Map(before);
      for (const program of programList) {
        map.set(program.id, {
          id: program.id,
          name: program.id,
          createAccountId: program.createAccountId,
          questionList: { tag: "None" },
        });
      }
      return map;
    });
  };

  const setAccount = (account: d.QAccount): void => {
    setAccountMap((before) => {
      return new Map(before).set(account.id, account);
    });
  };

  const setQuestionList = (questionList: ReadonlyArray<d.QQuestion>): void => {
    setQuestionMap((before) => {
      const map = new Map(before);
      for (const question of questionList) {
        map.set(question.id, question);
      }
      return map;
    });
  };
  const setQuestion = (question: d.QQuestion): void => {
    setQuestionMap((before) => {
      return new Map(before).set(question.id, question);
    });
  };

  useEffect(() => {
    // ブラウザで戻るボタンを押したときのイベントを登録
    window.addEventListener("popstate", () => {
      setLocation(commonUrl.urlToLocation(new URL(window.location.href)));
    });

    const urlData = commonUrl.urlToUrlData(new URL(window.location.href));
    console.log("urlData", urlData);
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
      api.getAccountByAccountToken(accountToken).then((response) => {
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
          accountToken,
          account: response.ok,
        });
        setAccount(response.ok);
      });
    });
  }, []);

  const getAccountToken = (): d.AccountToken | undefined => {
    switch (loginState.tag) {
      case "LoggedIn":
        return loginState.accountToken;
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
          `LINEログインのURLを発行できなかった ${response.error}`,
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

  return {
    loginState,
    requestLogin,
    createdProgramListState: createdProgramList,
    logout: () => {
      indexedDb.deleteAccountToken();
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
        return;
      }
      const projectNameResult = stringToValidProjectName(programName);
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
            enqueueSnackbar(`プログラム作成に失敗した ${response.error}`, {
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
    program: (programId) => {
      return programMap.get(programId);
    },
    account: (accountId) => {
      return accountMap.get(accountId);
    },
    requestGetCreatedProgram: () => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        return;
      }
      setCreatedProgramList({ tag: "Requesting" });
      api.getCreatedProgram(accountToken).then((response) => {
        if (response._ === "Error") {
          enqueueSnackbar(
            `作成したプログラムの取得に失敗した ${response.error}`,
            {
              variant: "error",
            }
          );
          setCreatedProgramList({ tag: "None" });
          return;
        }
        setCreatedProgramList({
          tag: "Loaded",
          projectIdList: response.ok.map((program) => program.id),
        });
        setProgramList(response.ok);
      });
    },
    requestGetQuestionListInProgram: (programId) => {
      const accountToken = getAccountToken();
      if (accountToken === undefined) {
        return;
      }
      api
        .getQuestionInCreatedProgram({
          accountToken,
          programId,
        })
        .then((response) => {
          if (response._ === "Error") {
            enqueueSnackbar(`質問の取得に失敗しました ${response.error}`, {
              variant: "error",
            });
            return;
          }
          setQuestionList(response.ok);
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
          setQuestion(response.ok);
          setLocation(d.QLocation.Question(response.ok.id));
        });
    },
    question: (id) => {
      return questionMap.get(id);
    },
  };
};

const back = () => {
  window.history.back();
};
