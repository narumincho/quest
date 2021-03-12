import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "../ui";
import { AppState } from "../state";

export const NewQuestion: React.VFC<{
  appState: AppState;
  account: d.QAccount;
}> = (props) => {
  return (
    <Box>
      <AppBar
        title="質問 新規作成"
        appState={props.appState}
        account={props.account}
      />
      <Typography>質問作成ページ</Typography>
    </Box>
  );
};
