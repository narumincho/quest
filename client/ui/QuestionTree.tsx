import * as React from "react";
import * as d from "../../data";
import * as state from "../state";
import { Box, Typography, makeStyles } from "@material-ui/core";
import { ChevronRight, ExpandMore } from "@material-ui/icons";
import { Link } from "./Link";

export const QuestionTreeList: React.VFC<{
  questionTreeList: ReadonlyArray<state.QuestionTree>;
  appState: state.AppState;
}> = (props) => {
  return (
    <Box>
      {props.questionTreeList.map((questionTree, index) => (
        <QuestionTree
          key={index}
          questionTree={questionTree}
          appState={props.appState}
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

export const QuestionTree: React.VFC<{
  questionTree: state.QuestionTree;
  appState: state.AppState;
}> = (props) => {
  const classes = useStyles();
  return (
    <Box className={classes.item}>
      <Link
        appState={props.appState}
        location={d.QLocation.Question(props.questionTree.id)}
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
          />
        ))}
      </Box>
    </Box>
  );
};
