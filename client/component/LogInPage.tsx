import * as React from "react";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { LineLoginButton } from "./LineLoginButton";

export type Props = {
  readonly appState: AppState;
};

export const LogInPage: React.VFC<Props> = (props) => {
  return (
    <Box>
      <AppBar appState={props.appState} isHideBack />
      <Box padding={1}>
        <Typography variant="body1">
          クエストを使うためにはLINEログインが必要です
        </Typography>
        <Box padding={1}>
          <LineLoginButton appState={props.appState} />
        </Box>
      </Box>
    </Box>
  );
};
