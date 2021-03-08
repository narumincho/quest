import * as d from "../data";
import * as indexedDb from "./indexedDb";
import * as url from "../common/url";
import { useEffect, useState } from "react";
import { api } from "./api";
import { createContainer } from "unstated-next";
import { useSnackbar } from "notistack";

type AppState =
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
      accountName: string;
      accountImageHash: d.ImageHash;
    };

const getAccountToken = (
  urlData: url.UrlData
): Promise<d.AccountToken | undefined> => {
  if (urlData.accountToken !== undefined) {
    return Promise.resolve(urlData.accountToken);
  }
  return indexedDb.getAccountToken();
};

const useAppStateInLocal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [appState, setAppState] = useState<AppState>({
    tag: "Loading",
  });
  useEffect(() => {
    const nowUrl = new URL(location.href);
    const urlData = url.pathAndHashToUrlData(nowUrl.pathname, nowUrl.hash);
    console.log("urlData", urlData);
    getAccountToken(urlData).then((accountToken) => {
      if (accountToken === undefined) {
        setAppState({ tag: "NoLogin" });
        return;
      }
      indexedDb.setAccountToken(accountToken);
      setAppState({
        tag: "VerifyingAccountToken",
        accountToken,
      });
      history.replaceState(undefined, "", url.locationToPath(urlData.location));
      api.getAccountByAccountToken(accountToken).then((response) => {
        if (response._ === "Error") {
          enqueueSnackbar(`ログインに失敗しました ${response.error}`, {
            variant: "error",
          });
          setAppState({
            tag: "NoLogin",
          });
          indexedDb.deleteAccountToken();
          return;
        }
        setAppState({
          tag: "LoggedIn",
          accountToken,
          accountName: response.ok.name,
          accountImageHash: response.ok.iconHash,
        });
      });
    });
  }, []);

  return {
    loginState: appState,
    accountToken: (): d.AccountToken | undefined => {
      switch (appState.tag) {
        case "LoggedIn":
          return appState.accountToken;
      }
      return undefined;
    },
    logout: () => {
      setAppState({
        tag: "NoLogin",
      });
    },
  };
};

export const AppStateContainer = createContainer(useAppStateInLocal);

export const useAppState = AppStateContainer.useContainer;
