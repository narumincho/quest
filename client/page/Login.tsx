import * as React from "react";
import { AppBar, LineLogInButton } from "../container";
import { Box, Typography } from "@material-ui/core";

export const Login: React.VFC<Record<string, never>> = () => {
  return (
    <Box>
      <AppBar title="ログイン" />
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
