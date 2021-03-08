import * as React from "react";
import { Box, CircularProgress } from "@material-ui/core";
import { AdminTop } from "./page/AdminTop";
import { Login } from "./page/Login";
import { useAppState } from "./state";

export const App: React.FC<Record<never, never>> = () => {
  const { loginState } = useAppState();
  switch (loginState.tag) {
    case "LoggedIn":
      return (
        <AdminTop
          accountName={loginState.accountName}
          accountImageHash={loginState.accountImageHash}
          accountToken={loginState.accountToken}
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
