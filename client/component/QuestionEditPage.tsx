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
  Typography,
} from "@mui/material";
import { LoggedInState, getParentQuestionList } from "../state/loggedInState";
import { AppState } from "../state";
import { Close } from "@mui/icons-material";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { QuestionButton } from "./QuestionCard";
import { TextEditor } from "./TextEditor";
import { stringToValidQuestionText } from "../../common/validation";

export const QuestionEditPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly questionId: d.QuestionId;
  readonly programId: d.ProgramId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const question = props.appState.question(props.questionId);

  if (question === undefined) {
    return (
      <PageContainer appState={props.appState} isDarkMode={props.isDarkMode}>
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

  return (
    <EditQuestionLoaded
      appState={props.appState}
      loggedInState={props.loggedInState}
      question={question}
      programId={props.programId}
      isDarkMode={props.isDarkMode}
    />
  );
};

type EditState = "none" | "selectParent" | "requesting";

const EditQuestionLoaded = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly question: d.Question;
  readonly programId: d.ProgramId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [text, setText] = React.useState<string>(props.question.name);
  const [parentQuestionId, setParentQuestionId] = React.useState<
    d.Option<d.QuestionId>
  >(props.question.parent);
  const [editState, setEditState] = React.useState<EditState>("none");
  const textResult = stringToValidQuestionText(text);
  const program = props.loggedInState.createdProgramMap.get(
    props.question.programId
  );
  const parentList =
    props.question.parent._ === "Some"
      ? getParentQuestionList(props.loggedInState, props.question.parent.value)
      : [];

  const editQuestion = () => {
    if (textResult._ === "Error") {
      return;
    }
    props.appState.editQuestion(
      props.question.id,
      textResult.okValue,
      parentQuestionId
    );
    setEditState("requesting");
  };
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
              location={d.Location.Program(props.question.programId)}
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
          <Typography variant="h5">質問の編集</Typography>
        </Box>
        <Box padding={1}>
          <TextEditor
            multiline
            label="質問文"
            value={text}
            onChangeOrReadonlyOrDisabled={
              editState === "none" ? setText : "readonly"
            }
            error={textResult._ === "Error"}
            helperText={textResult._ === "Error" ? textResult.errorValue : ""}
            isDarkMode={props.isDarkMode}
          />
        </Box>

        <Box padding={1}>
          <Box>親の質問</Box>
          {parentQuestionId._ === "Some" ? (
            <QuestionButton
              appState={props.appState}
              questionId={parentQuestionId.value}
              programId={props.programId}
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            }}
          >
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
                setParentQuestionId(d.Option.None());
              }}
              selected={parentQuestionId._ === "None"}
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
                    key={q.id}
                    button
                    onClick={() => {
                      setEditState("none");
                      setParentQuestionId(d.Option.Some(q.id));
                    }}
                    selected={
                      parentQuestionId._ === "Some" &&
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
    </PageContainer>
  );
};
