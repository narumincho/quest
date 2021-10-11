import * as React from "react";
import * as d from "../../data";
import * as q from "../state/question";
import { Box, Typography } from "@mui/material";
import { AppState } from "../state";
import { ChevronRight } from "@mui/icons-material";
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

export const QuestionTree = (props: {
  readonly questionTree: q.QuestionTree;
  readonly appState: AppState;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  return (
    <Box
      sx={{
        borderLeft: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Link
        appState={props.appState}
        location={d.Location.AdminQuestion({
          questionId: props.questionTree.id,
          programId: props.programId,
        })}
      >
        <Box sx={{ display: "flex" }}>
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
