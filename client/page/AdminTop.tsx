import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../container";
import { Box, Fab, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";

type Props = {
  account: d.QAccount;
};

const useStyles = makeStyles({
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});

export const AdminTop: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Box>
      <AppBar title="作成したプロジェクト" account={props.account} isHideBack />
      <Box padding={1}>プロジェクト一覧を表示したい</Box>
      <Link location="NewProject">
        <Fab
          color="primary"
          variant="extended"
          aria-label="add"
          className={classes.fab}
        >
          <Add />
          プロジェクト作成
        </Fab>
      </Link>
    </Box>
  );
};
