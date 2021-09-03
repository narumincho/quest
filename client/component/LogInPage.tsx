import * as React from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { LineLoginButton } from "./LineLoginButton";
import { PageContainer } from "./PageContainer";
import { nowMode } from "../../common/nowMode";

export type Props = {
  readonly appState: AppState;
};

/**
 * ログインページ. ログインしていない時に表示されるページ
 */
export const LogInPage: React.VFC<Props> = (props) => {
  return (
    <PageContainer appState={props.appState} isHideBack>
      <Box padding={1}>
        <Typography variant="body1">
          クエストを使うためにはLINEログインが必要です
          {props.appState.location._ === "ClassInvitation"
            ? ". ログインした後にクラスに参加することができます"
            : ""}
        </Typography>
      </Box>
      <Box padding={1}>
        <LineLoginButton appState={props.appState} />
      </Box>
      {nowMode === "development" ? (
        <Box>
          <Box padding={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => props.appState.requestLogInAsTestAccount("test0")}
              data-cy="logInAsTestAccount"
            >
              テスト0 としてログインする
            </Button>
          </Box>
          <Box padding={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => props.appState.requestLogInAsTestAccount("test1")}
              data-cy="logInAsTestAccount"
            >
              テスト1 としてログインする
            </Button>
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </PageContainer>
  );
};
