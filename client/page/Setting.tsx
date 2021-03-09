import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { Avatar, Box, Button } from "@material-ui/core";
import { AppBar } from "../container";
import { useAppState } from "../state";

export const Setting: React.VFC<{ account: d.QAccount }> = (props) => {
  const { logout } = useAppState();
  return (
    <Box>
      <AppBar title="設定" />
      <Box padding={1}>
        <Box padding={1}>アカウントID: {props.account.id}</Box>
        <Box padding={1}>
          アカウント画像:
          <Avatar
            alt={props.account.name}
            src={commonUrl.imageUrl(props.account.iconHash).toString()}
          />
        </Box>
        <Box padding={1}>
          アカウント名:
          {props.account.name}
        </Box>
        <Button variant="contained" onClick={logout}>
          ログアウト
        </Button>
      </Box>
    </Box>
  );
};
