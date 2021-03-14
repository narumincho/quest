import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import { Box, Button, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppState } from "../state";
import { ProgramCard } from "../ui/ProgramCard";
import { QuestionCard } from "../ui/QuestionCard";

export const Question: React.VFC<{
  appState: AppState;
  questionId: d.QQuestionId;
}> = (props) => {
  const question = props.appState.question(props.questionId);
  const children = props.appState.questionChildren(props.questionId);

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
        {question.parent._ === "Just" ? (
          <Box padding={1}>
            親:
            <QuestionCard
              appState={props.appState}
              questionId={question.parent.value}
            />
          </Box>
        ) : (
          <></>
        )}
        <Box padding={1}>
          子:
          {children.map((child) => (
            <QuestionCard
              key={child}
              appState={props.appState}
              questionId={child}
            />
          ))}
        </Box>
        <Box padding={1}>
          <Link
            appState={props.appState}
            location={d.QLocation.NewQuestion({
              parent: d.Maybe.Just(question.id),
              programId: question.programId,
              text: "",
            })}
          >
            <Button fullWidth startIcon={<Add />} variant="contained">
              子の質問を作成する
            </Button>
          </Link>
        </Box>

        <Box padding={1}>
          プログラム:
          <ProgramCard
            appState={props.appState}
            programId={question.programId}
          />
        </Box>
        <Box padding={1}>
          <Typography>質問ID: {props.questionId}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
