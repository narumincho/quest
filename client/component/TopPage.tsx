import * as React from "react";
import * as d from "../../data";
import { AppState, LoggedInState, ProgramWithClassList } from "../state";
import { Box, Button, Paper, Typography, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { JoinedClass } from "../state/loggedInState";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ProgramCard } from "./ProgramCard";

export type Props = {
  appState: AppState;
  loggedInState: LoggedInState;
};

export const TopPage: React.VFC<Props> = (props) => {
  return (
    <PageContainer isHideBack appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">作成したプログラム</Typography>
      </Box>
      <CreatedProgramList
        appState={props.appState}
        createdProgramList={props.loggedInState.createdProgramMap}
      />
      <Box padding={1}>
        <Link location={d.Location.NewProgram} appState={props.appState}>
          <Button variant="contained" startIcon={<Add />} fullWidth>
            プログラム作成
          </Button>
        </Link>
      </Box>
      <Box padding={1}>
        <Typography variant="h5">参加したクラス</Typography>
      </Box>
      <JoinedClassList
        appState={props.appState}
        joinedClassList={[...props.loggedInState.joinedClassMap.values()]}
      />
    </PageContainer>
  );
};

const useCreatedProgramListStyles = makeStyles({
  container: {
    display: "grid",
    gap: 8,
    padding: 8,
  },
});

export const CreatedProgramList: React.VFC<{
  readonly appState: AppState;
  readonly createdProgramList: ReadonlyMap<d.ProgramId, ProgramWithClassList>;
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
    <Box className={classes.container}>
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

const useJoinedClassListStyles = makeStyles({
  container: {
    display: "grid",
    gap: 8,
    padding: 8,
  },
});

const JoinedClassList = (props: {
  readonly appState: AppState;
  readonly joinedClassList: ReadonlyArray<JoinedClass>;
}): React.ReactElement => {
  const classes = useJoinedClassListStyles();
  if (props.joinedClassList.length === 0) {
    return (
      <Box padding={1} paddingTop={4}>
        <Typography align="center">クラスに1つも参加していません</Typography>
      </Box>
    );
  }
  return (
    <Box className={classes.container}>
      {props.joinedClassList.map((classAndRole) => (
        <ClassStudentOrGuestCard
          key={classAndRole.class.id}
          appState={props.appState}
          participantClass={classAndRole.class}
        />
      ))}
    </Box>
  );
};

const useClassStudentOrGuestCardStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 16,
  },
});

const ClassStudentOrGuestCard = (props: {
  readonly participantClass: d.ParticipantClass;
  readonly appState: AppState;
}): React.ReactElement => {
  const classes = useClassStudentOrGuestCardStyles();
  return (
    <Link
      appState={props.appState}
      location={d.Location.Class(props.participantClass.id)}
    >
      <Paper className={classes.card}>
        <Typography>
          {props.participantClass.name}
          {props.participantClass.role === "Guest" ? "(ゲスト)" : "(生徒)"}
        </Typography>
      </Paper>
    </Link>
  );
};
