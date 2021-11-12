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
import {
  LoggedInState,
  getClassAndRole,
  getQuestionText,
  getStudentSelfQuestionTree,
} from "../state/loggedInState";
import { Publish, Save } from "@mui/icons-material";
import { AccountCard } from "./AccountCard";
import { AppState } from "../state";
import { CommentAndAnswersFromOtherStudents } from "./CommentAndAnswersFromOtherStudents";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { TextEditor } from "./TextEditor";
import { stringToValidAnswerText } from "../../common/validation";

export const StudentAnswerPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly answerIdData: d.AnswerIdData;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  if (props.loggedInState.account.id === props.answerIdData.answerStudentId) {
    const studentSelfQuestionTree = getStudentSelfQuestionTree(
      props.loggedInState,
      props.answerIdData.classId,
      props.answerIdData.questionId
    );
    if (studentSelfQuestionTree === undefined) {
      return (
        <NotFoundQuestion
          appState={props.appState}
          classId={props.answerIdData.classId}
          isDarkMode={props.isDarkMode}
          loggedInState={props.loggedInState}
        />
      );
    }

    return (
      <StudentSelfEditQuestionPageLoaded
        question={studentSelfQuestionTree}
        appState={props.appState}
        classId={props.answerIdData.classId}
        loggedInState={props.loggedInState}
        loggedInAccountId={props.loggedInState.account.id}
        isDarkMode={props.isDarkMode}
      />
    );
  }

  const questionText = getQuestionText(
    props.loggedInState,
    props.answerIdData.questionId
  );
  if (questionText === undefined) {
    return (
      <NotFoundQuestion
        appState={props.appState}
        classId={props.answerIdData.classId}
        isDarkMode={props.isDarkMode}
        loggedInState={props.loggedInState}
      />
    );
  }

  return (
    <PageLoadedOtherStudentView
      questionId={props.answerIdData.questionId}
      questionText={questionText}
      appState={props.appState}
      classId={props.answerIdData.classId}
      answerStudentId={props.answerIdData.answerStudentId}
      loggedInState={props.loggedInState}
      isDarkMode={props.isDarkMode}
    />
  );
};

const NotFoundQuestion = (props: {
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly isDarkMode: boolean;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const qClass = getClassAndRole(props.loggedInState, props.classId);
  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
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
      <Box padding={1}>質問が見つかりませんでした</Box>
    </PageContainer>
  );
};

const StudentSelfEditQuestionPageLoaded = (props: {
  readonly question: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly loggedInAccountId: d.AccountId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [answerText, setAnswerText] = React.useState<string>(
    props.question.answer._ === "Some" ? props.question.answer.value.text : ""
  );
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const changeAnswerText = React.useCallback((newAnswerText: string) => {
    setIsFirst(false);
    setAnswerText(newAnswerText);
  }, []);

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
  const qClass = getClassAndRole(props.loggedInState, props.classId);

  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
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
        <TextEditor
          multiline
          label="あなたの回答"
          value={answerText}
          onChangeOrReadonlyOrDisabled={changeAnswerText}
          error={!isFirst && validationResult._ === "Error"}
          helperText={
            !isFirst && validationResult._ === "Error"
              ? validationResult.errorValue
              : ""
          }
          isDarkMode={props.isDarkMode}
        />
      </Box>
      <Box padding={1}>
        <TemplateSaveButton
          onClick={() => {
            answerQuestion(false);
          }}
          disabled={!isFirst && validationResult._ === "Error"}
        />
      </Box>
      <Box padding={1}>
        <ConfirmSaveButton
          onClick={() => {
            answerQuestion(true);
          }}
          disabled={!isFirst && validationResult._ === "Error"}
        />
      </Box>
      {props.question.answer._ === "Some" &&
      props.question.answer.value.isConfirm ? (
        <CommentAndAnswersFromOtherStudents
          appState={props.appState}
          classId={props.classId}
          questionId={props.question.questionId}
          loggedInState={props.loggedInState}
          answerStudentId={props.loggedInAccountId}
          answersFromOtherStudents={undefined}
          isDarkMode={props.isDarkMode}
        />
      ) : (
        <></>
      )}

      <Dialog open={isSaving}>
        <DialogTitle>質問を保存中</DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </PageContainer>
  );
};

const TemplateSaveButton = (props: {
  readonly onClick: () => void;
  readonly disabled: boolean;
}): React.ReactElement => {
  return (
    <Button
      fullWidth
      onClick={props.onClick}
      size="large"
      disabled={props.disabled}
      variant="contained"
      color="primary"
      startIcon={<Save />}
    >
      回答を一時保存する
    </Button>
  );
};

const ConfirmSaveButton = (props: {
  readonly onClick: () => void;
  readonly disabled: boolean;
}): React.ReactElement => {
  return (
    <Button
      fullWidth
      onClick={props.onClick}
      size="large"
      disabled={props.disabled}
      variant="contained"
      color="secondary"
      startIcon={<Publish />}
    >
      回答を確定して保存する
    </Button>
  );
};

const PageLoadedOtherStudentView = (props: {
  readonly questionId: d.QuestionId;
  readonly questionText: string;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly answerStudentId: d.AccountId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [answersFromOtherStudents, setAnswersFromOtherStudents] =
    React.useState<ReadonlyArray<d.AnswersFromOtherStudent> | undefined>(
      undefined
    );
  React.useEffect(() => {
    props.appState
      .requestAnswersFromOtherStudents({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
      })
      .then((response) => {
        setAnswersFromOtherStudents(response);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.classId, props.questionId, props.answerStudentId]);

  const qClass = getClassAndRole(props.loggedInState, props.classId);
  const question = answersFromOtherStudents?.find(
    (answer) => answer.studentId === props.answerStudentId
  );

  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
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
        <Typography variant="h4">{props.questionText}</Typography>
      </Box>
      <Box>
        <AccountCard
          loggedInState={props.loggedInState}
          accountId={props.answerStudentId}
        />
      </Box>
      <Box padding={1}>
        {question === undefined ? "読込中..." : question.answerText}
      </Box>

      <CommentAndAnswersFromOtherStudents
        appState={props.appState}
        classId={props.classId}
        questionId={props.questionId}
        loggedInState={props.loggedInState}
        answerStudentId={props.answerStudentId}
        answersFromOtherStudents={answersFromOtherStudents}
        isDarkMode={props.isDarkMode}
      />
    </PageContainer>
  );
};
