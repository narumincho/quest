import * as React from "react";
import { AppBar, Box, Toolbar, Typography } from "@material-ui/core";
import { LineLogInButton } from "../LineLoginButton";

export const Login: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">ログイン</Typography>
        </Toolbar>
      </AppBar>
      <Box padding={1}>
        <Typography variant="body1">
          クエストを使うためにはLINEログインが必要です
        </Typography>
        <Box padding={1}>
          <LineLogInButton />
        </Box>
      </Box>
    </Box>
  );
};
