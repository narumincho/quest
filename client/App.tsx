import * as React from "react";
import * as d from "../data";
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
    };

export const App: React.FC<Record<never, never>> = () => {
  const [state, setState] = React.useState<State>({
    tag: "Loading",
  });

  React.useEffect(() => {
    const nowUrl = new URL(location.href);
    const urlData = url.pathAndHashToUrlData(nowUrl.pathname, nowUrl.hash);
    console.log("urlData", urlData);
    if (urlData.accountToken === undefined) {
      setState({ tag: "NoLogin" });
      return;
    }
    setState({
      tag: "VerifyingAccountToken",
      accountToken: urlData.accountToken,
    });
    history.replaceState(undefined, "", url.locationToPath(urlData.location));
    const accountToken = urlData.accountToken;
    api.getAccountByAccountToken(urlData.accountToken).then((response) => {
      if (response._ === "Just") {
        setState({
          tag: "LoggedIn",
          accountToken,
          accountName: response.value,
        });
      }
    });
  }, []);

  switch (state.tag) {
    case "LoggedIn":
      return (
        <AdminTop
          accountName={state.accountName}
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
