import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import { AppState } from "../state";
import { ProgramCard } from "../ui/ProgramCard";
import { QuestionCard } from "../ui/QuestionCard";
import { stringToValidQuestionText } from "../../common/validation";

export const NewQuestion: React.VFC<{
  appState: AppState;
  programId: d.QProgramId;
  parent: d.QQuestionId | undefined;
}> = (props) => {
  const [text, setText] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const textResult = stringToValidQuestionText(text);
  const program = props.appState.program(props.programId);

  const createQuestion = () => {
    setIsFirst(false);
    if (textResult._ === "Error") {
      return;
    }
    props.appState.createQuestion(props.programId, props.parent, textResult.ok);
    setIsCreating(true);
  };

  const parentList: ReadonlyArray<d.QQuestion> =
    props.parent === undefined
      ? []
      : props.appState.questionParentList(d.Maybe.Just(props.parent));
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
              location={d.QLocation.Program(props.programId)}
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
          <Typography variant="h5">質問作成</Typography>
        </Box>
        <Box padding={1}>
          <TextField
            multiline
            required
            fullWidth
            label="質問文"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            error={!isFirst && textResult._ === "Error"}
            helperText={
              !isFirst && textResult._ === "Error"
                ? textResult.error
                : undefined
            }
            variant="outlined"
            InputProps={{
              readOnly: isCreating,
            }}
          />
        </Box>
        <Box padding={1}>
          プログラム:
          <ProgramCard appState={props.appState} programId={props.programId} />
        </Box>
        <Box padding={1}>
          親の質問:
          {props.parent === undefined ? (
            "指定なし"
          ) : (
            <QuestionCard appState={props.appState} questionId={props.parent} />
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
    </Box>
  );
};

const getParentQuestion = (
  appState: AppState,
  parentId: d.QQuestionId | undefined
): ReadonlyArray<d.QQuestion> => {
  if (parentId === undefined) {
    return [];
  }
  const parent = appState.question(parentId);
  if (parent === undefined) {
    return [];
  }
  return [parent];
};
