import * as React from "react";
import * as d from "../../data";
import { Box, Button, Paper, Typography } from "@mui/material";
import {
  LoggedInState,
  getQuestionForProgramCreator,
} from "../state/loggedInState";
import { AppState } from "../state";
import { Link } from "./Link";

export type Props = {
  readonly questionId: d.QuestionId;
  readonly appState: AppState;
  readonly programId: d.ProgramId;
  readonly loggedInState: LoggedInState;
};

/**
 * 質問へのリンクがついた, 質問の内容を表示するカード
 */
export const QuestionCard = (props: Props): React.ReactElement => {
  const question = getQuestionForProgramCreator(
    props.loggedInState,
    props.questionId
  );
  if (question === undefined) {
    return <Box>質問の情報を読込中</Box>;
  }
  return (
    <Link
      appState={props.appState}
      location={d.Location.AdminQuestion({
        questionId: props.questionId,
        programId: props.programId,
      })}
    >
      <Paper
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          padding: 2,
        }}
      >
        <Typography>{question.name}</Typography>
      </Paper>
    </Link>
  );
};

/**
 * 質問の内容を表示するカード
 */
export const QuestionButton = (
  props: Props & { readonly onClick: () => void }
): React.ReactElement => {
  const question = getQuestionForProgramCreator(
    props.loggedInState,
    props.questionId
  );
  if (question === undefined) {
    return <Box>質問の情報を読込中</Box>;
  }
  return (
    <Button
      variant="contained"
      onClick={props.onClick}
      fullWidth
      sx={{
        display: "grid",
        alignItems: "center",
        gridAutoFlow: "column",
        padding: 2,
      }}
    >
      <Typography>{question.name}</Typography>
    </Button>
  );
};
