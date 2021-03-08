import * as commonUrl from "../common/url";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import { useEffect, useState } from "react";
import { api } from "./api";
import { createContainer } from "unstated-next";
import { useSnackbar } from "notistack";

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

const getAccountToken = (
  urlData: commonUrl.UrlData
): Promise<d.AccountToken | undefined> => {
  if (urlData.accountToken !== undefined) {
    return Promise.resolve(urlData.accountToken);
  }
  return indexedDb.getAccountToken();
};

const useAppStateInLocal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loginState, setLoginState] = useState<LoginState>({
    tag: "Loading",
  });
  const [location, setLocation] = useState<d.QLocation>("Top");
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
    getAccountToken(urlData).then((accountToken) => {
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

  return {
    loginState,
    accountToken: (): d.AccountToken | undefined => {
      switch (loginState.tag) {
        case "LoggedIn":
          return loginState.accountToken;
      }
      return undefined;
    },
    logout: () => {
      setLoginState({
        tag: "NoLogin",
      });
    },
    location,
    jump: (newLocation: d.QLocation): void => {
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
    },
  };
};

export const AppStateContainer = createContainer(useAppStateInLocal);

export const useAppState = AppStateContainer.useContainer;
