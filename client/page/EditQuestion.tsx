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
import { stringToValidQuestionText } from "../../common/validation";

export const EditQuestion: React.VFC<{
  appState: AppState;
  questionId: d.QQuestionId;
}> = (props) => {
  const question = props.appState.question(props.questionId);

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

  return <EditQuestionLoaded appState={props.appState} question={question} />;
};

const EditQuestionLoaded: React.VFC<{
  appState: AppState;
  question: d.QQuestion;
}> = (props) => {
  const [text, setText] = React.useState<string>(props.question.name);
  const [isRequesting, setIsRequesting] = React.useState<boolean>(false);
  const textResult = stringToValidQuestionText(text);
  const program = props.appState.program(props.question.programId);
  const parentList = props.appState.questionParentList(props.question.parent);

  const editQuestion = () => {
    if (textResult._ === "Error") {
      return;
    }
    setIsRequesting(true);
  };
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
              location={d.QLocation.Program(props.question.programId)}
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
          <Typography variant="h5">質問の編集</Typography>
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
            error={textResult._ === "Error"}
            helperText={textResult._ === "Error" ? textResult.error : undefined}
            variant="outlined"
            InputProps={{
              readOnly: isRequesting,
            }}
          />
        </Box>
        <Box padding={1}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={editQuestion}
          >
            質問を保存する
          </Button>
        </Box>
      </Box>
      <Dialog open={isRequesting}>
        <DialogTitle>質問を保存中</DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </Box>
  );
};
