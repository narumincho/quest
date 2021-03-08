import * as React from "react";
import * as d from "../../data";
import { AppBar } from "../ui";
import { Box } from "@material-ui/core";

export const NewProject: React.VFC<{
  accountToken: d.AccountToken;
  account: d.QAccount;
}> = (props) => {
  return (
    <Box>
      <AppBar title="プロジェクト作成" account={props.account}></AppBar>
      <Box padding={1}>
        プロジェクト作成に必要なフォームと送信ボタンを置きたい
      </Box>
    </Box>
  );
};
