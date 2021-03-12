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

export type AppState = {
  /** ログイン状態 */
  loginState: LoginState;
  /** 現在のページの場所 */
  location: d.QLocation;
  /** 作成したプログラムの取得状態 */
  createdProgramListState: CreatedProgramListState;

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
  /** プログラムの情報を得る */
  program: (id: d.QProgramId) => d.QProgram | undefined;
  /** アカウントの情報を得る */
  account: (id: d.AccountId) => d.QAccount | undefined;
  /** 作成したプログラムを取得する */
  requestGetCreatedProgram: () => void;
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
    ReadonlyMap<d.QProgramId, d.QProgram>
  >(new Map());
  const [accountMap, setAccountMap] = useState<
    ReadonlyMap<d.AccountId, d.QAccount>
  >(new Map());
  const [
    createdProgramList,
    setCreatedProgramList,
  ] = useState<CreatedProgramListState>({ tag: "None" });

  const setProgram = (program: d.QProgram): void => {
    setProgramMap((before) => {
      return new Map(before).set(program.id, program);
    });
  };

  const setProgramList = (programList: ReadonlyArray<d.QProgram>): void => {
    setProgramMap((before) => {
      const map = new Map(before);
      for (const program of programList) {
        map.set(program.id, program);
      }
      return map;
    });
  };

  const setAccount = (account: d.QAccount): void => {
    setAccountMap((before) => {
      return new Map(before).set(account.id, account);
    });
  };

  useEffect(() => {
    // ブラウザで戻るボタンを押したときのイベントを登録
    window.addEventListener("popstate", () => {
      setLocation(commonUrl.pathToLocation(window.location.pathname));
    });

    const nowUrl = new URL(window.location.href);
    const urlData = commonUrl.pathAndHashToUrlData(
      nowUrl.pathname,
      nowUrl.hash
    );
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
        commonUrl.locationToPath(urlData.location)
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
  };
};

const back = () => {
  window.history.back();
};
