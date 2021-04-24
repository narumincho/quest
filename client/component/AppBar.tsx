import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import {
  Avatar,
  IconButton,
  AppBar as MAppBar,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AppState } from "../state";
import { ArrowBack } from "@material-ui/icons";
import { Link } from "./Link";

export type Props = {
  /**
   * アプリの状態
   */
  appState: AppState;
  /**
   * 戻るボタンを隠すか
   */
  isHideBack: boolean;
};

const useStyles = makeStyles({
  title: {
    flexGrow: 1,
  },
});

export const AppBar: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <MAppBar position="sticky">
      <Toolbar>
        {props.isHideBack ? (
          <></>
        ) : (
          <IconButton onClick={props.appState.back}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" className={classes.title}>
          クエスト
        </Typography>
        {props.appState.loginState.tag === "LoggedIn" ? (
          <Link location={d.QLocation.Setting} appState={props.appState}>
            <Avatar
              alt={props.appState.loginState.account.name}
              src={commonUrl
                .imageUrl(props.appState.loginState.account.iconHash)
                .toString()}
            />
          </Link>
        ) : (
          <></>
        )}
      </Toolbar>
    </MAppBar>
  );
};
