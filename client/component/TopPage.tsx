import * as React from "react";
import * as d from "../../data";
import { Box, Button, Paper, Typography } from "@mui/material";
import {
  JoinedClass,
  LoggedInState,
  ProgramWithClassList,
} from "../state/loggedInState";
import { Add } from "@mui/icons-material";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ProgramCard } from "./ProgramCard";

export type Props = {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
};

export const TopPage = (props: Props): React.ReactElement => {
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

export const CreatedProgramList = (props: {
  readonly appState: AppState;
  readonly createdProgramList: ReadonlyMap<d.ProgramId, ProgramWithClassList>;
}): React.ReactElement => {
  if (props.createdProgramList.size === 0) {
    return (
      <Box padding={1} paddingTop={4}>
        <Typography align="center">作成したプログラムはありません</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "grid", gap: 1, padding: 1 }}>
      {[...props.createdProgramList].map(([programId]) => (
        <ProgramCard
          key={programId}
          createdProgramMap={props.createdProgramList}
          appState={props.appState}
          programId={programId}
        />
      ))}
    </Box>
  );
};

const JoinedClassList = (props: {
  readonly appState: AppState;
  readonly joinedClassList: ReadonlyArray<JoinedClass>;
}): React.ReactElement => {
  if (props.joinedClassList.length === 0) {
    return (
      <Box padding={1} paddingTop={4}>
        <Typography align="center">クラスに1つも参加していません</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "grid", gap: 1, padding: 1 }}>
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

const ClassStudentOrGuestCard = (props: {
  readonly participantClass: d.ParticipantClass;
  readonly appState: AppState;
}): React.ReactElement => {
  return (
    <Link
      appState={props.appState}
      location={d.Location.Class(props.participantClass.id)}
    >
      <Paper
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          padding: 2,
        }}
      >
        <Typography>
          {props.participantClass.name}
          {props.participantClass.role === "Guest" ? "(ゲスト)" : "(生徒)"}
        </Typography>
      </Paper>
    </Link>
  );
};
