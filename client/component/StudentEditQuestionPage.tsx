import * as React from "react";
import * as d from "../../data";
import { Box, TextField, Typography } from "@material-ui/core";
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
  const [answerText, setAnswerText] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const changeAnswerText = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setIsFirst(false);
      setAnswerText(event.target.value);
    },
    []
  );
  const validationResult = stringToValidAnswerText(answerText);

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
  if (question === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>質問が見つからなかった.</Box>
      </PageContainer>
    );
  }
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
    </PageContainer>
  );
};
