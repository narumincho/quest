import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import { Publish, Save } from "@material-ui/icons";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";
import { stringToValidAnswerText } from "../../common/validation";
import { studentSelfQuestionTreeListFind } from "../../common/studentSelfQuestionTree";

export type Props = {
  readonly appState: AppState;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
};

export const StudentEditQuestionPage: React.VFC<Props> = (props) => {
  const questionTreeList = props.appState.getStudentQuestionTree(props.classId);
  const [answerText, setAnswerText] = React.useState<string | undefined>(
    undefined
  );
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const changeAnswerText = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setIsFirst(false);
      setAnswerText(event.target.value);
    },
    []
  );

  React.useEffect(() => {
    if (answerText === undefined) {
      return;
    }
    if (questionTreeList === undefined) {
      return;
    }
    const question = studentSelfQuestionTreeListFind(
      questionTreeList,
      props.questionId
    );
    if (question !== undefined && question.answer._ === "Some") {
      setAnswerText(question.answer.value.text);
    }
  }, [answerText, props.questionId, questionTreeList]);

  if (questionTreeList === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>質問が見つからなかった</Box>
      </PageContainer>
    );
  }
  const question = studentSelfQuestionTreeListFind(
    questionTreeList,
    props.questionId
  );
  const validationResult = stringToValidAnswerText(answerText ?? "");

  if (question === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>質問が見つからなかった.</Box>
      </PageContainer>
    );
  }

  const answerQuestion = (isConfirm: boolean): void => {
    setIsFirst(false);
    if (
      isSaving ||
      validationResult._ === "Error" ||
      answerText === undefined
    ) {
      return;
    }
    setIsSaving(true);
    props.appState.answerQuestion({
      answerText,
      classId: props.classId,
      isConfirm,
      questionId: props.questionId,
    });
  };
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">{question.questionText}</Typography>
      </Box>
      <Box padding={1}>
        <TextField
          multiline
          required
          fullWidth
          label="あなたの回答"
          value={answerText}
          onChange={changeAnswerText}
          error={!isFirst && validationResult._ === "Error"}
          helperText={
            !isFirst && validationResult._ === "Error"
              ? validationResult.errorValue
              : undefined
          }
          variant="outlined"
          InputProps={{
            readOnly: false,
          }}
        />
      </Box>
      <Box padding={1}>
        <Button
          fullWidth
          onClick={() => {
            answerQuestion(false);
          }}
          size="large"
          disabled={!isFirst && validationResult._ === "Error"}
          variant="contained"
          color="primary"
          startIcon={<Save />}
        >
          回答を一時保存する
        </Button>
      </Box>
      <Box padding={1}>
        <Button
          fullWidth
          onClick={() => {
            answerQuestion(true);
          }}
          size="large"
          disabled={!isFirst && validationResult._ === "Error"}
          variant="contained"
          color="secondary"
          startIcon={<Publish />}
        >
          回答を確定して保存する
        </Button>
      </Box>
      <Dialog open={isSaving}>
        <DialogTitle>質問を保存中</DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </PageContainer>
  );
};
