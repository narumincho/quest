import * as React from "react";
import * as d from "../data";
import * as indexedDb from "./indexedDb";
import * as url from "../common/url";
import { Box, CircularProgress } from "@material-ui/core";
import { AdminTop } from "./page/AdminTop";
import { Login } from "./page/Login";
import { api } from "./api";

type State =
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

export const App: React.FC<Record<never, never>> = () => {
  const [state, setState] = React.useState<State>({
    tag: "Loading",
  });

  React.useEffect(() => {
    const nowUrl = new URL(location.href);
    const urlData = url.pathAndHashToUrlData(nowUrl.pathname, nowUrl.hash);
    console.log("urlData", urlData);
    getAccountToken(urlData).then((accountToken) => {
      if (accountToken === undefined) {
        setState({ tag: "NoLogin" });
        return;
      }
      indexedDb.setAccountToken(accountToken);
      setState({
        tag: "VerifyingAccountToken",
        accountToken,
      });
      history.replaceState(undefined, "", url.locationToPath(urlData.location));
      api.getAccountByAccountToken(accountToken).then((response) => {
        if (response._ === "Just") {
          setState({
            tag: "LoggedIn",
            accountToken,
            accountName: response.value.name,
            accountImageHash: response.value.iconHash,
          });
        }
      });
    });
  }, []);

  switch (state.tag) {
    case "LoggedIn":
      return (
        <AdminTop
          accountName={state.accountName}
          accountImageHash={state.accountImageHash}
          accountToken={state.accountToken}
        />
      );
    case "NoLogin":
      return <Login />;
    default:
      return (
        <Box alignContent="center" justifyContent="center">
          <CircularProgress />
        </Box>
      );
  }
};
