import * as React from "react";
import * as d from "../../data";
import * as q from "../state/question";
import { Box, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { ChevronRight } from "@material-ui/icons";
import { Link } from "./Link";

export const QuestionTreeList = (props: {
  readonly questionTreeList: ReadonlyArray<q.QuestionTree>;
  readonly appState: AppState;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  return (
    <Box>
      {props.questionTreeList.map((questionTree, index) => (
        <QuestionTree
          key={index}
          questionTree={questionTree}
          appState={props.appState}
          programId={props.programId}
        />
      ))}
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  item: {
    borderLeft: `solid 1px ${theme.palette.divider}`,
  },
  label: {
    display: "flex",
  },
}));

export const QuestionTree = (props: {
  readonly questionTree: q.QuestionTree;
  readonly appState: AppState;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  const classes = useStyles();
  return (
    <Box className={classes.item}>
      <Link
        appState={props.appState}
        location={d.Location.AdminQuestion({
          questionId: props.questionTree.id,
          programId: props.programId,
        })}
      >
        <Box className={classes.label}>
          <ChevronRight />
          <Typography>{props.questionTree.text}</Typography>
        </Box>
      </Link>

      <Box padding={1}>
        {props.questionTree.children.map((child) => (
          <QuestionTree
            questionTree={child}
            appState={props.appState}
            key={child.id}
            programId={props.programId}
          />
        ))}
      </Box>
    </Box>
  );
};
