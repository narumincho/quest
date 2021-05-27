import * as React from "react";
import * as d from "../../data";
import {
  AppState,
  LoggedInState,
  ProgramWithQuestionIdListAndClassIdList,
} from "../state";
import { Box, Fab, Typography, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ProgramCard } from "./ProgramCard";

export type Props = {
  appState: AppState;
  loggedInState: LoggedInState;
};

const useStyles = makeStyles({
  fab: {
    position: "fixed",
    bottom: 16,
    right: 16,
  },
});

export const AdminTopPage: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <PageContainer isHideBack appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">作成したプログラム</Typography>
      </Box>
      <CreatedProgramList
        appState={props.appState}
        createdProgramList={props.loggedInState.createdProgramList}
      />
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
    </PageContainer>
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
  readonly appState: AppState;
  readonly createdProgramList: ReadonlyMap<
    d.QProgramId,
    ProgramWithQuestionIdListAndClassIdList
  >;
}> = (props) => {
  const classes = useCreatedProgramListStyles();
  if (props.createdProgramList.size === 0) {
    return (
      <Box padding={1} paddingTop={4}>
        <Typography align="center">作成したプログラムはありません</Typography>
      </Box>
    );
  }
  return (
    <Box className={classes.box}>
      {[...props.createdProgramList].map(([programId]) => (
        <ProgramCard
          key={programId}
          appState={props.appState}
          programId={programId}
        />
      ))}
    </Box>
  );
};
