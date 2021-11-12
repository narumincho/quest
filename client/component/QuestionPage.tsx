import * as React from "react";
import * as d from "../../data";
import { Add, Edit } from "@mui/icons-material";
import { Box, Breadcrumbs, Button, Fab, Typography } from "@mui/material";
import {
  LoggedInState,
  getParentQuestionList,
  getQuestionDirectChildren,
  getQuestionForProgramCreator,
} from "../state/loggedInState";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ProgramCard } from "./ProgramCard";
import { QuestionCard } from "./QuestionCard";

export const QuestionPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly questionId: d.QuestionId;
  readonly programId: d.ProgramId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  React.useEffect(() => {
    const question = getQuestionForProgramCreator(
      props.loggedInState,
      props.questionId
    );
    if (question === undefined) {
      props.appState.requestGetQuestionListInProgram(props.programId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.questionId]);

  const question = getQuestionForProgramCreator(
    props.loggedInState,
    props.questionId
  );
  const children = getQuestionDirectChildren(
    props.loggedInState,
    props.questionId
  );

  if (question === undefined) {
    return (
      <PageContainer
        appState={props.appState}
        isDarkMode={props.isDarkMode}
        leftActionType="back"
      >
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
  const parentList =
    question.parent._ === "Some"
      ? getParentQuestionList(props.loggedInState, question.parent.value)
      : [];

  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
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
        <Box
          sx={{
            padding: 1,
            display: "grid",
            gap: 1,
          }}
        >
          子:
          {children.map((child) => (
            <QuestionCard
              key={child}
              appState={props.appState}
              questionId={child}
              programId={props.programId}
              loggedInState={props.loggedInState}
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
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <Edit />
          質問を編集する
        </Fab>
      </Link>
    </PageContainer>
  );
};
