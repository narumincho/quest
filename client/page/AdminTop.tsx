import * as React from "react";
import * as d from "../../data";
import * as url from "../../common/url";
import { AppBar, Box, Toolbar, Typography } from "@material-ui/core";

type Props = {
  accountToken: d.AccountToken;
  accountName: string;
  accountImageHash: d.ImageHash;
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
        <img
          src={url.imageUrl(props.accountImageHash).toString()}
          alt="アカウントの画像"
        />
        <Typography variant="body1">
          {props.accountName} さん こんにちは
        </Typography>
      </Box>
    </Box>
  );
};
