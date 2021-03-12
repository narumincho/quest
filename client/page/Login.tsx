import * as React from "react";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "../ui";
import { AppState } from "../state";
import { LineLogInButton } from "../container/LineLoginButton";

export type Props = {
  readonly appState: AppState;
};

export const Login: React.VFC<Props> = (props) => {
  return (
    <Box>
      <AppBar title="ログイン" appState={props.appState} />
      <Box padding={1}>
        <Typography variant="body1">
          クエストを使うためにはLINEログインが必要です
        </Typography>
        <Box padding={1}>
          <LineLogInButton appState={props.appState} />
        </Box>
      </Box>
    </Box>
  );
};
