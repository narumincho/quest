import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import { Box, Breadcrumbs, Button, Typography } from "@material-ui/core";
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
        <AppBar appState={props.appState} />
        <Box></Box>
      </Box>
    );
  }
  const program = props.appState.program(question.programId);
  const parentList = props.appState.questionParentList(question.parent);

  return (
    <Box>
      <AppBar appState={props.appState} />
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.QLocation.Top}>
              作成したプログラム
            </Link>
            <Link
              appState={props.appState}
              location={d.QLocation.Program(question.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>
            {[...parentList].reverse().map((parent) => (
              <Link
                appState={props.appState}
                location={d.QLocation.Question(parent.id)}
              >
                {parent.name}
              </Link>
            ))}
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">{question.name}</Typography>
        </Box>
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
