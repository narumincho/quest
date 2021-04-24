import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Close } from "@material-ui/icons";
import { Link } from "./Link";
import { QuestionButton } from "./QuestionCard";
import { stringToValidQuestionText } from "../../common/validation";

export const QuestionEditPage: React.VFC<{
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

type EditState = "none" | "selectParent" | "requesting";

const useStyles = makeStyles({
  dialogTitle: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
  },
});

const EditQuestionLoaded: React.VFC<{
  appState: AppState;
  question: d.QQuestion;
}> = (props) => {
  const classes = useStyles();
  const [text, setText] = React.useState<string>(props.question.name);
  const [parentQuestionId, setParentQuestionId] = React.useState<
    d.Maybe<d.QQuestionId>
  >(props.question.parent);
  const [editState, setEditState] = React.useState<EditState>("none");
  const textResult = stringToValidQuestionText(text);
  const program = props.appState.program(props.question.programId);
  const parentList = props.appState.questionParentList(props.question.parent);

  const editQuestion = () => {
    if (textResult._ === "Error") {
      return;
    }
    props.appState.editQuestion(
      props.question.id,
      textResult.ok,
      parentQuestionId
    );
    setEditState("requesting");
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
              readOnly: editState !== "none",
            }}
          />
        </Box>

        <Box padding={1}>
          <Box>親の質問</Box>
          {parentQuestionId._ === "Just" ? (
            <QuestionButton
              appState={props.appState}
              questionId={parentQuestionId.value}
              onClick={() => {
                setEditState("selectParent");
              }}
            />
          ) : (
            <Button
              onClick={() => {
                setEditState("selectParent");
              }}
              fullWidth
              variant="contained"
            >
              --指定なし--
            </Button>
          )}
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
      <Dialog open={editState === "requesting"}>
        <DialogTitle>質問を保存中</DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
      <Dialog
        fullScreen
        open={editState === "selectParent"}
        onClose={() => {
          setEditState("none");
        }}
        scroll="paper"
      >
        <DialogTitle>
          <Box className={classes.dialogTitle}>
            親の質問を選択
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                setEditState("none");
              }}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            <ListItem
              button
              onClick={() => {
                setEditState("none");
                setParentQuestionId(d.Maybe.Nothing());
              }}
              selected={parentQuestionId._ === "Nothing"}
            >
              <ListItemText primary="--指定なし--" />
            </ListItem>
            {props.appState
              .getQuestionThatCanBeParentList(
                props.question.programId,
                props.question.id
              )
              .map((q) => {
                return (
                  <ListItem
                    button
                    onClick={() => {
                      setEditState("none");
                      setParentQuestionId(d.Maybe.Just(q.id));
                    }}
                    selected={
                      parentQuestionId._ === "Just" &&
                      parentQuestionId.value === q.id
                    }
                  >
                    <ListItemText primary={q.name} />
                  </ListItem>
                );
              })}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
