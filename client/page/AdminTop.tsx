import * as React from "react";
import * as d from "../../data";
import * as url from "../../common/url";
import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Link } from "../ui/Link";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

type Props = {
  account: d.QAccount;
};

export const AdminTop: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            作成したプロジェクト
          </Typography>
          <Link location={{ tag: "setting" }}>
            <Avatar
              alt={props.account.name}
              src={url.imageUrl(props.account.iconHash).toString()}
            />
          </Link>
        </Toolbar>
      </AppBar>
      <Box padding={1}>プロジェクト一覧を表示したい</Box>
    </Box>
  );
};
