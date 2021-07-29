import * as React from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { LineLoginButton } from "./LineLoginButton";
import { PageContainer } from "./PageContainer";
import { nowMode } from "../../common/nowMode";

export type Props = {
  readonly appState: AppState;
};

export const LogInPage: React.VFC<Props> = (props) => {
  return (
    <PageContainer appState={props.appState} isHideBack>
      <Box padding={1}>
        <Typography variant="body1">
          クエストを使うためにはLINEログインが必要です
        </Typography>
      </Box>
      <Box padding={1}>
        <LineLoginButton appState={props.appState} />
      </Box>
      {nowMode === "development" ? (
        <Box padding={1}>
          <Button
            fullWidth
            variant="contained"
            onClick={props.appState.requestLogInAsTestAccount}
            data-cy="logInAsTestAccount"
          >
            テストアカウントとしてログインする
          </Button>
        </Box>
      ) : (
        <></>
      )}
    </PageContainer>
  );
};
