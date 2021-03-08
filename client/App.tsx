import * as React from "react";
import * as d from "../data";
import { Box, CircularProgress } from "@material-ui/core";
import { AdminTop } from "./page/AdminTop";
import { Login } from "./page/Login";
import { NewProject } from "./page/NewProject";
import { Setting } from "./page/Setting";
import { useAppState } from "./state";

export const App: React.VFC<Record<never, never>> = () => {
  const { loginState } = useAppState();
  switch (loginState.tag) {
    case "LoggedIn":
      return (
        <LoggedIn
          accountToken={loginState.accountToken}
          account={loginState.account}
        />
      );
    case "NoLogin":
      return <Login />;
    default:
      return (
        <Box
          alignContent="center"
          justifyContent="center"
          width="100%"
          height="100%"
        >
          <CircularProgress />
        </Box>
      );
  }
};

const LoggedIn: React.VFC<{
  accountToken: d.AccountToken;
  account: d.QAccount;
}> = (props) => {
  const { location } = useAppState();
  switch (location) {
    case "Top":
      return <AdminTop account={props.account} />;
    case "Setting":
      return <Setting account={props.account} />;
    case "NewProject":
      return (
        <NewProject accountToken={props.accountToken} account={props.account} />
      );
  }
};
