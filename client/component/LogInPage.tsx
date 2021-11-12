import * as React from "react";
import * as d from "../../data";
import { Box, Button, Typography } from "@mui/material";
import { AppState } from "../state";
import { LineLoginButton } from "./LineLoginButton";
import { PageContainer } from "./PageContainer";
import { nowMode } from "../../common/nowMode";

/**
 * ログインページ. ログインしていない時に表示されるページ
 */
export const LogInPage = (props: {
  readonly appState: AppState;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  return (
    <PageContainer
      appState={props.appState}
      leftActionType="none"
      isDarkMode={props.isDarkMode}
    >
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
          {testAccountList.map((testAccount) => (
            <Box key={testAccount.accountToken} padding={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  props.appState.requestLogInAsTestAccount(
                    testAccount.accountToken
                  )
                }
                data-cy="logInAsTestAccount"
              >
                {testAccount.name} としてログインする
              </Button>
            </Box>
          ))}
        </Box>
      ) : (
        <></>
      )}
    </PageContainer>
  );
};

const testAccountList: ReadonlyArray<{
  readonly accountToken: d.AccountToken;
  readonly name: string;
}> = [
  {
    accountToken: d.AccountToken.fromString(
      "a5b7058a6c75fe48875a8591abe7a49f82f5c3aaf52614f4fbc971ae9db1c91b"
    ),
    name: "テスト0",
  },
  {
    accountToken: d.AccountToken.fromString(
      "27a078a04810cd94e77ba7900ec09dcfa18093fdf80f154723fb102588772615"
    ),
    name: "テスト1",
  },
  {
    accountToken: d.AccountToken.fromString(
      "26cd9216f54a222215b28c53b09cc6350acba2de9a42091b55a9f7ea9f18e4ff"
    ),
    name: "テスト2",
  },
];
