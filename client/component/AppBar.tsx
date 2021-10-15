import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { ArrowBack, Notifications } from "@mui/icons-material";
import {
  Avatar,
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
}): React.ReactElement => {
  return (
    <MAppBar enableColorOnDark position="sticky">
      <Toolbar>
        {props.isHideBack ? (
          <></>
        ) : (
          <IconButton onClick={props.appState.back}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          クエスト
        </Typography>
        {props.appState.logInState.tag === "LoggedIn" ? (
          <>
            <Link location={d.Location.Notification} appState={props.appState}>
              <Notifications />
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
          </>
        ) : (
          <></>
        )}
      </Toolbar>
    </MAppBar>
  );
};
