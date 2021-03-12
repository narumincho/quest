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
   * タイトルの文字
   */
  title: string;
  /**
   * 右に表示するアカウント. 指定なしで非表示
   */
  account?: d.QAccount;
  /**
   * 戻るボタンを隠すか
   * @default false
   */
  isHideBack?: boolean;
};

const useStyles = makeStyles({
  title: {
    flexGrow: 1,
  },
});

export const AppBar: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <MAppBar position="static">
      <Toolbar>
        {props.isHideBack ? (
          <></>
        ) : (
          <IconButton onClick={props.appState.back}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" className={classes.title}>
          {props.title}
        </Typography>
        {props.account === undefined ? (
          <></>
        ) : (
          <Link location={d.QLocation.Setting} appState={props.appState}>
            <Avatar
              alt={props.account.name}
              src={commonUrl.imageUrl(props.account.iconHash).toString()}
            />
          </Link>
        )}
      </Toolbar>
    </MAppBar>
  );
};
