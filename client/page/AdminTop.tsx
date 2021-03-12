import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import { Box, Fab, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppState } from "../state";

export type Props = {
  account: d.QAccount;
  appState: AppState;
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
      <AppBar
        title="作成したプログラム"
        account={props.account}
        isHideBack
        appState={props.appState}
      />
      <Box padding={1}>プログラム一覧を表示したい</Box>
      <Link location={d.QLocation.NewProgram} appState={props.appState}>
        <Fab
          color="primary"
          variant="extended"
          aria-label="add"
          className={classes.fab}
        >
          <Add />
          プログラム作成
        </Fab>
      </Link>
    </Box>
  );
};
