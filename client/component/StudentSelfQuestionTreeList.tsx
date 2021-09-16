import * as React from "react";
import * as d from "../../data";
import { Box, Typography, makeStyles } from "@material-ui/core";
import { ChevronRight, Done, Edit } from "@material-ui/icons";
import { AppState } from "../state";
import { Link } from "./Link";

export const StudentSelfQuestionTreeList = (props: {
  readonly treeList: ReadonlyArray<d.StudentSelfQuestionTree> | undefined;
  readonly appState: AppState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  if (props.treeList === undefined) {
    return <Box padding={1}>取得中 </Box>;
  }
  return (
    <Box padding={1}>
      {props.treeList.map((tree) => (
        <StudentSelfQuestionTree
          key={tree.questionId}
          tree={tree}
          appState={props.appState}
          classId={props.classId}
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
    gap: 8,
  },
}));

export const StudentSelfQuestionTree = (props: {
  readonly tree: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  const classes = useStyles();
  return (
    <Box className={classes.item}>
      <Link
        appState={props.appState}
        location={d.Location.StudentAnswer({
          questionId: props.tree.questionId,
          classId: props.classId,
        })}
      >
        <Box className={classes.label}>
          <Icon answer={props.tree.answer} />
          <Typography>{props.tree.questionText}</Typography>
        </Box>
      </Link>
      <StudentSelfQuestionTreeList
        treeList={props.tree.children}
        appState={props.appState}
        classId={props.classId}
      />
    </Box>
  );
};

const Icon = (props: {
  readonly answer: d.Option<d.StudentAnswerAndIsConfirm>;
}): React.ReactElement => {
  if (props.answer._ === "Some") {
    if (props.answer.value.isConfirm) {
      return <Done />;
    }
    return <Edit />;
  }
  return <ChevronRight />;
};
