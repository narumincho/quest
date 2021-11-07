import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { ArrowBack, Notifications } from "@mui/icons-material";
import {
  Avatar,
  Box,
  IconButton,
  AppBar as MAppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";

/**
 * 画面上部に 大抵いつも表示される AppBar. 戻るボタンと, ログインしているアカウントを確認できる
 */
export const AppBar = (props: {
  /** アプリの状態と操作 */
  readonly appState: AppState;
  /** 戻るボタンを隠すか */
  readonly isHideBack: boolean;
  /** ダークモードか */
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  return (
    <MAppBar
      position="sticky"
      sx={{
        backgroundColor: props.isDarkMode ? "#000" : "#fff",
        color: props.isDarkMode ? "#eee" : "#000",
      }}
    >
      <Toolbar>
        {props.isHideBack ? (
          <></>
        ) : (
          <IconButton onClick={props.appState.back}>
            <ArrowBack sx={{ color: props.isDarkMode ? "#eee" : "#000" }} />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          クエスト
        </Typography>
        {props.appState.logInState.tag === "LoggedIn" ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Link location={d.Location.Notification} appState={props.appState}>
              <Notifications
                sx={{
                  color: "#ddd",
                  width: 48,
                  height: 48,
                  display: "grid",
                  padding: 1,
                }}
              />
            </Link>
            <Link location={d.Location.Setting} appState={props.appState}>
              <Avatar
                alt={props.appState.logInState.loggedInState.account.name}
                src={commonUrl
                  .imageUrl(
                    props.appState.logInState.loggedInState.account.iconHash
                  )
                  .toString()}
              />
            </Link>
          </Box>
        ) : (
          <></>
        )}
      </Toolbar>
    </MAppBar>
  );
};
