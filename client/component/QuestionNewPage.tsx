import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Typography,
} from "@mui/material";
import { LoggedInState, getParentQuestionList } from "../state/loggedInState";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ProgramCard } from "./ProgramCard";
import { QuestionCard } from "./QuestionCard";
import { TextEditor } from "./TextEditor";
import { stringToValidQuestionText } from "../../common/validation";

export const QuestionNewPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly programId: d.ProgramId;
  readonly parent: d.QuestionId | undefined;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [text, setText] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const textResult = stringToValidQuestionText(text);
  const program = props.loggedInState.createdProgramMap.get(props.programId);

  const createQuestion = (): void => {
    setIsFirst(false);
    if (textResult._ === "Error") {
      return;
    }
    props.appState.createQuestion(
      props.programId,
      props.parent,
      textResult.okValue
    );
    setIsCreating(true);
  };

  const parentList: ReadonlyArray<d.Question> =
    props.parent === undefined
      ? []
      : getParentQuestionList(props.loggedInState, props.parent);
  return (
    <PageContainer appState={props.appState} isDarkMode={props.isDarkMode}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <Link
              appState={props.appState}
              location={d.Location.Program(props.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>
            {[...parentList].reverse().map((parent) => (
              <Link
                key={parent.id}
                appState={props.appState}
                location={d.Location.AdminQuestion({
                  questionId: parent.id,
                  programId: props.programId,
                })}
              >
                {parent.name}
              </Link>
            ))}
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">質問作成</Typography>
        </Box>
        <Box padding={1}>
          <TextEditor
            multiline
            label="質問文"
            value={text}
            onChangeOrReadonlyOrDisabled={isCreating ? "readonly" : setText}
            error={!isFirst && textResult._ === "Error"}
            helperText={
              !isFirst && textResult._ === "Error" ? textResult.errorValue : ""
            }
            isDarkMode={props.isDarkMode}
          />
        </Box>
        <Box padding={1}>
          プログラム:
          <ProgramCard
            appState={props.appState}
            createdProgramMap={props.loggedInState.createdProgramMap}
            programId={props.programId}
          />
        </Box>
        <Box padding={1}>
          親の質問:
          {props.parent === undefined ? (
            "指定なし"
          ) : (
            <QuestionCard
              appState={props.appState}
              questionId={props.parent}
              programId={props.programId}
            />
          )}
        </Box>
        <Box padding={1}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={createQuestion}
          >
            質問を作成する
          </Button>
        </Box>
      </Box>
      <Dialog open={isCreating}>
        <DialogTitle>質問を作成中</DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </PageContainer>
  );
};
