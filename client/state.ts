import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import { VariantType, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { api } from "./api";
import { stringToValidProjectName } from "../common/validation";

export type AppState = {
  loginState: LoginState;
  accountToken: () => d.AccountToken | undefined;
  logout: () => void;
  location: d.QLocation;
  /** 指定したページへ移動する */
  jump: (newLocation: d.QLocation) => void;
  /** 指定したページへ推移するが, 今いたページの履歴を置き換える */
  changeLocation: (newLocation: d.QLocation) => void;
  /** ページ推移を戻る */
  back: () => void;
  addNotification: (message: string, variant: VariantType) => void;
  /** プログラムを作成する */
  createProgram: (programName: string) => void;
  /** プログラムの情報を得る */
  program: (id: d.QProgramId) => d.QProgram | undefined;
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

  const setProgram = (program: d.QProgram): void => {
    setProgramMap((before) => {
      return new Map(before).set(program.id, program);
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
    accountToken: getAccountToken,
    logout: () => {
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
            enqueueSnackbar(`プログラム作成に失敗した ${response.error}`);
            return;
          }
          setProgram(response.ok);
          changeLocation(d.QLocation.Program(response.ok.id));
        });
    },
    program: (programId) => {
      return programMap.get(programId);
    },
  };
};

const back = () => {
  window.history.back();
};
