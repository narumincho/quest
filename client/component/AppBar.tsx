import * as React from "react";
import * as d from "../../data";
import { ArrowBack, Menu, Notifications } from "@mui/icons-material";
import {
  Badge,
  Box,
  Drawer,
  IconButton,
  AppBar as MAppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import { AccountIcon } from "./AccountIcon";
import { AppState } from "../state";
import { Link } from "./Link";
import { getNotDoneNotificationCount } from "../state/loggedInState";

export type LeftActionType = "none" | "back" | "menu";
/**
 * 画面上部に 大抵いつも表示される AppBar. 戻るボタンと, ログインしているアカウントを確認できる
 */
export const AppBar = (props: {
  /** アプリの状態と操作 */
  readonly appState: AppState;
  /** 左に置くボタン */
  readonly leftActionType: LeftActionType;
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
        <LeftAction
          leftActionType={props.leftActionType}
          isDarkMode={props.isDarkMode}
          appState={props.appState}
        />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          クエスト
        </Typography>
        {props.appState.logInState.tag === "LoggedIn" ? (
          <Box display="flex">
            <Link location={d.Location.Notification} appState={props.appState}>
              <Box
                display="grid"
                width={48}
                height={48}
                alignContent="center"
                justifyContent="center"
              >
                <Badge
                  color="secondary"
                  badgeContent={getNotDoneNotificationCount(
                    props.appState.logInState.loggedInState
                  )}
                >
                  <Notifications
                    sx={{
                      color: props.isDarkMode ? "#eee" : "#000",
                    }}
                  />
                </Badge>
              </Box>
            </Link>
          </Box>
        ) : (
          <></>
        )}
      </Toolbar>
    </MAppBar>
  );
};

const LeftAction = (props: {
  readonly leftActionType: LeftActionType;
  readonly isDarkMode: boolean;
  readonly appState: AppState;
}): React.ReactElement => {
  const [isOpenMenu, setIsOpenMenu] = React.useState<boolean>(false);
  switch (props.leftActionType) {
    case "none":
      return <Box></Box>;
    case "back":
      return (
        <IconButton onClick={props.appState.back}>
          <ArrowBack sx={{ color: props.isDarkMode ? "#eee" : "#000" }} />
        </IconButton>
      );
    case "menu":
      return (
        <Box>
          <IconButton onClick={() => setIsOpenMenu(true)}>
            <Menu sx={{ color: props.isDarkMode ? "#eee" : "#000" }} />
          </IconButton>
          <Drawer
            anchor="left"
            open={isOpenMenu}
            onClose={() => {
              setIsOpenMenu(false);
            }}
          >
            <Box width={250} padding={1}>
              <Typography>Quest</Typography>
              {props.appState.logInState.tag === "LoggedIn" ? (
                <Link location={d.Location.Setting} appState={props.appState}>
                  <Box display="flex" alignItems="center">
                    <AccountIcon
                      name={
                        props.appState.logInState.loggedInState.account.name
                      }
                      imageHashValue={
                        props.appState.logInState.loggedInState.account.iconHash
                      }
                    />
                    <Typography>
                      {props.appState.logInState.loggedInState.account.name}
                    </Typography>
                  </Box>
                </Link>
              ) : (
                <></>
              )}
            </Box>
          </Drawer>
        </Box>
      );
  }
};
