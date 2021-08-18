import * as React from "react";
import * as d from "../../data";
import { Box, TextField, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";
import { stringToValidAnswerText } from "../../common/validation";

export type Props = {
  readonly appState: AppState;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
};

export const StudentEditQuestionPage: React.VFC<Props> = (props) => {
  const question = props.appState.question(props.questionId);
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

  if (question === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>質問が見つからなかった</Box>
      </PageContainer>
    );
  }
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">{question.name}</Typography>
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
