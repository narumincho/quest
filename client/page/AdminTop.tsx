import * as React from "react";
import * as d from "../../data";
import { AppBar, Box, Toolbar, Typography } from "@material-ui/core";

type Props = {
  accountToken: d.AccountToken;
  accountName: string;
};

export const AdminTop: React.FunctionComponent<Props> = (props) => {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">作成したプロジェクト</Typography>
        </Toolbar>
      </AppBar>
      <Box padding={1}>
        <Typography variant="body1">
          {props.accountName} さん こんにちは
        </Typography>
      </Box>
    </Box>
  );
};
