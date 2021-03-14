import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "../ui";
import { AppState } from "../state";
import { ProgramCard } from "../ui/ProgramCard";

export const Question: React.VFC<{
  appState: AppState;
  questionId: d.QQuestionId;
}> = (props) => {
  const question = props.appState.question(props.questionId);
  if (question === undefined) {
    return (
      <Box padding={1}>
        <AppBar title="質問 読み込み中" appState={props.appState} />
        <Box></Box>
      </Box>
    );
  }
  return (
    <Box>
      <AppBar title="質問" appState={props.appState} />
      <Box padding={1}>
        <Box padding={1}>
          <Typography variant="h5">{question.name}</Typography>
        </Box>

        <Box padding={1}>
          プログラム:
          <ProgramCard
            appState={props.appState}
            programId={question.programId}
          />
        </Box>
        <Box padding={1}>
          <Typography>質問ID: {props.questionId}</Typography>{" "}
        </Box>
      </Box>
    </Box>
  );
};
