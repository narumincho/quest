import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { AppBar } from "../ui";
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

  const createQuestion = () => {
    setIsFirst(false);
    if (textResult._ === "Error") {
      return;
    }
    props.appState.createQuestion(props.programId, props.parent, textResult.ok);
    setIsCreating(true);
  };

  return (
    <Box>
      <AppBar title="質問 新規作成" appState={props.appState} />
      <Box padding={1}>
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
        {props.parent === undefined ? (
          <></>
        ) : (
          <Box padding={1}>
            親の質問:
            <QuestionCard appState={props.appState} questionId={props.parent} />
          </Box>
        )}

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
