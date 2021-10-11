import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@mui/material";
import { ChevronRight, Done, Edit } from "@mui/icons-material";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";

export const StudentSelfQuestionTreeList = (props: {
  readonly treeList: ReadonlyArray<d.StudentSelfQuestionTree> | undefined;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
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
          loggedInState={props.loggedInState}
        />
      ))}
    </Box>
  );
};

export const StudentSelfQuestionTree = (props: {
  readonly tree: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  return (
    <Box
      sx={{
        borderLeft: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Link
        appState={props.appState}
        location={d.Location.StudentAnswer({
          questionId: props.tree.questionId,
          classId: props.classId,
          answerStudentId: props.loggedInState.account.id,
        })}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Icon answer={props.tree.answer} />
          <Typography>{props.tree.questionText}</Typography>
        </Box>
      </Link>
      <StudentSelfQuestionTreeList
        treeList={props.tree.children}
        appState={props.appState}
        classId={props.classId}
        loggedInState={props.loggedInState}
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
