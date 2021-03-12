import * as React from "react";
import * as d from "../../data";
import { Box, Paper, Typography, makeStyles } from "@material-ui/core";
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

export const QuestionCard: React.VFC<Props> = (props) => {
  const classes = useStyles();
  const question = props.appState.question(props.questionId);
  if (question === undefined) {
    return <Box>アカウントの情報を読込中</Box>;
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
