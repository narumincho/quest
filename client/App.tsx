import * as React from "react";
import * as d from "../data";
import { Box, CircularProgress } from "@material-ui/core";
import { AdminTop } from "./page/AdminTop";
import { Login } from "./page/Login";
import { Setting } from "./page/Setting";
import { useAppState } from "./state";

export const App: React.VFC<Record<never, never>> = () => {
  const { loginState } = useAppState();
  switch (loginState.tag) {
    case "LoggedIn":
      return (
        <LoggedIn
          accountName={loginState.accountName}
          accountImageHash={loginState.accountImageHash}
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
  accountName: string;
  accountImageHash: d.ImageHash;
}> = (props) => {
  const { location } = useAppState();
  switch (location.tag) {
    case "top":
      return (
        <AdminTop
          accountName={props.accountName}
          accountImageHash={props.accountImageHash}
        />
      );
    case "setting":
      return <Setting />;
  }
};
