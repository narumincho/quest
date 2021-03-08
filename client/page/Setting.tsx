import * as React from "react";
import * as commonUrl from "../../common/url";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { useAppState } from "../state";

export const Setting: React.VFC<Record<never, never>> = () => {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            onClick={() => {
              window.history.back();
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">アカウント設定</Typography>
        </Toolbar>
      </AppBar>
      <AccountDetail />
    </Box>
  );
};

const AccountDetail: React.VFC<Record<never, never>> = () => {
  const { logout, loginState } = useAppState();

  if (loginState.tag !== "LoggedIn") {
    return <Box>ログインしていない. 設定項目はない</Box>;
  }
  return (
    <Box padding={1}>
      <Box padding={1}>アカウントID: {loginState.account.id}</Box>
      <Box padding={1}>
        アカウント画像:
        <Avatar
          alt={loginState.account.name}
          src={commonUrl.imageUrl(loginState.account.iconHash).toString()}
        />
      </Box>
      <Box padding={1}>
        アカウント名:
        {loginState.account.name}
      </Box>
      <Button variant="contained" onClick={logout}>
        ログアウト
      </Button>
    </Box>
  );
};
