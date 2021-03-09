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
import { ArrowBack } from "@material-ui/icons";
import { Link } from "../container/Link";

export type Props = {
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
  /**
   * 戻るボタンを押した
   */
  onBackClick: () => void;
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
          <IconButton onClick={props.onBackClick}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" className={classes.title}>
          {props.title}
        </Typography>
        {props.account === undefined ? (
          <></>
        ) : (
          <Link location="Setting">
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
