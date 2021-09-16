import * as React from "react";
import * as d from "../../data";
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
import { Publish, Save } from "@material-ui/icons";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { stringToValidAnswerText } from "../../common/validation";
import { studentSelfQuestionTreeListFind } from "../../common/studentSelfQuestionTree";

export type Props = {
  readonly appState: AppState;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
};

export const StudentQuestionPage: React.VFC<Props> = (props) => {
  const questionTreeList = props.appState.getStudentQuestionTree(props.classId);

  if (questionTreeList === undefined) {
    return (
      <NotFoundQuestion appState={props.appState} classId={props.classId} />
    );
  }
  const question = studentSelfQuestionTreeListFind(
    questionTreeList,
    props.questionId
  );

  if (question === undefined) {
    return (
      <NotFoundQuestion appState={props.appState} classId={props.classId} />
    );
  }

  return (
    <StudentEditQuestionPageLoaded
      question={question}
      appState={props.appState}
      classId={props.classId}
    />
  );
};

const NotFoundQuestion = (props: {
  readonly appState: AppState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  const qClass = props.appState.getClassAndRole(props.classId);
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Breadcrumbs>
          <Link appState={props.appState} location={d.Location.Top}>
            トップページ
          </Link>
          <Link
            appState={props.appState}
            location={d.Location.Class(props.classId)}
          >
            {qClass.tag === "participant"
              ? qClass.joinedClass.class.name
              : "クラス"}
          </Link>

          <div></div>
        </Breadcrumbs>
      </Box>
    </PageContainer>
  );
};

const StudentEditQuestionPageLoaded = (props: {
  readonly question: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  const [answerText, setAnswerText] = React.useState<string>(
    props.question.answer._ === "Some" ? props.question.answer.value.text : ""
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

  const validationResult = stringToValidAnswerText(answerText);

  const answerQuestion = (isConfirm: boolean): void => {
    setIsFirst(false);
    if (isSaving || validationResult._ === "Error") {
      return;
    }
    setIsSaving(true);
    props.appState.answerQuestion({
      answerText,
      classId: props.classId,
      isConfirm,
      questionId: props.question.questionId,
    });
  };
  const qClass = props.appState.getClassAndRole(props.classId);

  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Breadcrumbs>
          <Link appState={props.appState} location={d.Location.Top}>
            トップページ
          </Link>
          <Link
            appState={props.appState}
            location={d.Location.Class(props.classId)}
          >
            {qClass.tag === "participant"
              ? qClass.joinedClass.class.name
              : "クラス"}
          </Link>

          <div></div>
        </Breadcrumbs>
      </Box>
      <Box padding={1}>
        <Typography variant="h4">{props.question.questionText}</Typography>
      </Box>
      {props.question.answer._ === "Some" ? (
        <Box padding={1}>
          <Typography variant="h5">
            保存した回答
            {props.question.answer.value.isConfirm ? " (確定済み)" : ""}
          </Typography>
          {props.question.answer.value.text}
        </Box>
      ) : (
        <></>
      )}
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
