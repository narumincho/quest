import * as React from "react";
import * as d from "../../data";
import { AppState, LoggedInState } from "../state";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Publish, Save } from "@material-ui/icons";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { stringToValidAnswerText } from "../../common/validation";
import { studentSelfQuestionTreeListFind } from "../../common/studentSelfQuestionTree";

export const StudentAnswerPage = (props: {
  readonly appState: AppState;
  readonly questionId: d.QuestionId;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
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
      loggedInState={props.loggedInState}
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
  readonly loggedInState: LoggedInState;
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
        <FeedbackOrAnswersFromOtherStudents
          appSate={props.appState}
          classId={props.classId}
          questionId={props.question.questionId}
          loggedInState={props.loggedInState}
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

const FeedbackOrAnswersFromOtherStudents = (props: {
  readonly appSate: AppState;
  readonly classId: d.ClassId;
  readonly questionId: d.QuestionId;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const [selectedTab, setSelectedTab] = React.useState<
    "feedback" | "answersFromOtherStudents"
  >("feedback");
  const [answersFromOtherStudents, setAnswersFromOtherStudents] =
    React.useState<string>("");

  React.useEffect(() => {
    props.appSate
      .requestAnswersFromOtherStudents({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
      })
      .then((response) => {
        setAnswersFromOtherStudents(JSON.stringify(response));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.classId, props.questionId]);

  return (
    <Box padding={1}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab === "feedback" ? 0 : 1}
          onChange={(_, v) => {
            setSelectedTab(v === 0 ? "feedback" : "answersFromOtherStudents");
          }}
          variant="fullWidth"
        >
          <Tab label="受け取ったフィードバック" />
          <Tab label="他の人の回答" />
        </Tabs>
      </Box>
      <Box padding={1}>
        {selectedTab === "feedback"
          ? "フィードバックの一覧表示"
          : "他の人の回答一覧表示"}
        {answersFromOtherStudents}
      </Box>
    </Box>
  );
};
