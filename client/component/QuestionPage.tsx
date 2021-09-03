import * as React from "react";
import * as d from "../../data";
import { Add, Edit } from "@material-ui/icons";
import { AppState, LoggedInState } from "../state";
import {
  Box,
  Breadcrumbs,
  Button,
  Fab,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
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

export const QuestionPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly questionId: d.QuestionId;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  React.useEffect(() => {
    const question = props.appState.question(props.questionId);
    if (question === undefined) {
      props.appState.requestGetQuestionListInProgram(props.programId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.questionId]);

  const question = props.appState.question(props.questionId);
  const children = props.appState.questionChildren(props.questionId);
  const classes = useStyle();

  if (question === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>
          <Box padding={1}>
            <Breadcrumbs>
              <Link appState={props.appState} location={d.Location.Top}>
                トップページ
              </Link>
              <div></div>
            </Breadcrumbs>
          </Box>
        </Box>
        <Box>質問読み込み準備中</Box>
        <Box padding={1}>
          <Typography>質問ID: {props.questionId}</Typography>
        </Box>
      </PageContainer>
    );
  }
  const program = props.loggedInState.createdProgramMap.get(question.programId);
  const parentList = props.appState.questionParentList(question.parent);

  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <Link
              appState={props.appState}
              location={d.Location.Program(question.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>
            {[...parentList].reverse().map((parent) => (
              <Link
                appState={props.appState}
                location={d.Location.AdminQuestion({
                  questionId: parent.id,
                  programId: props.programId,
                })}
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
              programId={props.programId}
            />
          ))}
        </Box>
        <Box padding={1}>
          <Link
            appState={props.appState}
            location={d.Location.NewQuestion({
              parent: d.Option.Some(question.id),
              programId: question.programId,
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
            createdProgramMap={props.loggedInState.createdProgramMap}
            programId={question.programId}
          />
        </Box>
        <Box padding={1}>
          <Typography>質問ID: {props.questionId}</Typography>
        </Box>
      </Box>
      <Link
        location={d.Location.EditQuestion({
          questionId: props.questionId,
          programId: props.programId,
        })}
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
    </PageContainer>
  );
};
