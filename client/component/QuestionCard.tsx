import * as React from "react";
import * as d from "../../data";
import { Box, Button, Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";

export type Props = {
  readonly questionId: d.QQuestionId;
  readonly appState: AppState;
};

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 16,
  },
});

/**
 * 質問へのリンクがついた, 質問の内容を表示するカード
 */
export const QuestionCard: React.VFC<Props> = (props) => {
  const classes = useStyles();
  const question = props.appState.question(props.questionId);
  if (question === undefined) {
    return <Box>質問の情報を読込中</Box>;
  }
  return (
    <Link
      appState={props.appState}
      location={d.QLocation.Question(props.questionId)}
    >
      <Paper className={classes.card}>
        <Typography>{question.name}</Typography>
      </Paper>
    </Link>
  );
};

/**
 * 質問の内容を表示するカード
 */
export const QuestionButton: React.VFC<Props & { onClick: () => void }> = (
  props
) => {
  const classes = useStyles();
  const question = props.appState.question(props.questionId);
  if (question === undefined) {
    return <Box>質問の情報を読込中</Box>;
  }
  return (
    <Button
      variant="contained"
      onClick={props.onClick}
      fullWidth
      className={classes.card}
    >
      <Typography>{question.name}</Typography>
    </Button>
  );
};
