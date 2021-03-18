import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import { Box, Fab, Typography, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppState } from "../state";
import { ProgramCard } from "../ui/ProgramCard";
import { Skeleton } from "@material-ui/lab";

export type Props = {
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

  React.useEffect(() => {
    props.appState.requestGetCreatedProgram();
  }, []);

  return (
    <Box>
      <AppBar isHideBack appState={props.appState} />
      <Box padding={1}>
        <Typography variant="h5">作成したプログラム</Typography>
      </Box>
      <CreatedProgramList appState={props.appState} />
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

const useCreatedProgramListStyles = makeStyles({
  box: {
    display: "grid",
    gap: 8,
    padding: 8,
  },
});

export const CreatedProgramList: React.VFC<{
  appState: AppState;
}> = (props) => {
  const classes = useCreatedProgramListStyles();
  switch (props.appState.createdProgramListState.tag) {
    case "None":
      return (
        <Box padding={1}>
          <Typography>取得準備中</Typography>
        </Box>
      );
    case "Requesting":
      return (
        <Box className={classes.box}>
          <Skeleton key="first" variant="rect" width="100%" height={88} />
          <Skeleton key="second" variant="rect" width="100%" height={88} />
        </Box>
      );
    case "Loaded":
      if (props.appState.createdProgramListState.projectIdList.length === 0) {
        return (
          <Box padding={1} paddingTop={4}>
            <Typography align="center">
              作成したプログラムはありません
            </Typography>
          </Box>
        );
      }
      return (
        <Box className={classes.box}>
          {props.appState.createdProgramListState.projectIdList.map(
            (programId) => (
              <ProgramCard
                key={programId}
                appState={props.appState}
                programId={programId}
              />
            )
          )}
        </Box>
      );
  }
};
