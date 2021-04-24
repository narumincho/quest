import * as React from "react";
import * as d from "../../data";
import { Add, Edit } from "@material-ui/icons";
import {
  Box,
  Breadcrumbs,
  Button,
  Fab,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Link } from "./Link";
import { ProgramCard } from "./ProgramCard";
import { QuestionCard } from "./QuestionCard";

const useStyle = makeStyles({
  childCardList: {
    padding: 8,
    display: "grid",
    gap: 8,
  },
  fab: {
    position: "fixed",
    bottom: 16,
    right: 16,
  },
});

export const QuestionPage: React.VFC<{
  appState: AppState;
  questionId: d.QQuestionId;
}> = (props) => {
  const question = props.appState.question(props.questionId);
  const children = props.appState.questionChildren(props.questionId);
  const classes = useStyle();

  if (question === undefined) {
    return (
      <Box>
        <AppBar appState={props.appState} />
        <Box padding={1}>
          <Box padding={1}>
            <Breadcrumbs>
              <Link appState={props.appState} location={d.QLocation.Top}>
                作成したプログラム
              </Link>
              <div></div>
            </Breadcrumbs>
          </Box>
        </Box>
        <Box>質問読み込み準備中</Box>
        <Box padding={1}>
          <Typography>質問ID: {props.questionId}</Typography>
        </Box>
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
                key={parent.id}
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
        <Box className={classes.childCardList}>
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
      <Link
        location={d.QLocation.EditQuestion(props.questionId)}
        appState={props.appState}
      >
        <Fab
          color="primary"
          variant="extended"
          aria-label="add"
          className={classes.fab}
        >
          <Edit />
          質問を編集する
        </Fab>
      </Link>
    </Box>
  );
};
