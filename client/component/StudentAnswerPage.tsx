import * as React from "react";
import * as d from "../../data";
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
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
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
      answerStudentId={props.loggedInState.account.id}
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
  readonly answerStudentId: d.AccountId;
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
          answerStudentId={props.answerStudentId}
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
  readonly answerStudentId: d.AccountId;
}): React.ReactElement => {
  const [selectedTab, setSelectedTab] = React.useState<
    "feedback" | "answersFromOtherStudents"
  >("feedback");
  const [answersFromOtherStudents, setAnswersFromOtherStudents] =
    React.useState<ReadonlyArray<d.AnswersFromOtherStudent> | undefined>(
      undefined
    );
  const [feedbackList, setFeedbackList] = React.useState<
    ReadonlyArray<d.Feedback> | undefined
  >(undefined);

  React.useEffect(() => {
    props.appSate
      .requestAnswersFromOtherStudents({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
      })
      .then((response) => {
        setAnswersFromOtherStudents(response);
      });

    props.appSate
      .requestFeedback({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
        answerStudentId: props.answerStudentId,
      })
      .then((response) => {
        setFeedbackList(response);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.classId, props.questionId, props.answerStudentId]);

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
        {selectedTab === "feedback" ? (
          <FeedbackListWithInput feedbackList={feedbackList} />
        ) : (
          <AnswerList answersFromOtherStudents={answersFromOtherStudents} />
        )}
      </Box>
    </Box>
  );
};

const FeedbackListWithInput = (props: {
  feedbackList: ReadonlyArray<d.Feedback> | undefined;
}): React.ReactElement => {
  return (
    <div>
      <TextField
        multiline
        required
        fullWidth
        label="この回答に対するフィードバック"
        value={""}
        onChange={() => {}}
        variant="outlined"
        InputProps={{
          readOnly: false,
        }}
      />
      <FeedbackList feedbackList={props.feedbackList} />
    </div>
  );
};

const FeedbackList = (props: {
  feedbackList: ReadonlyArray<d.Feedback> | undefined;
}): React.ReactElement => {
  if (props.feedbackList === undefined) {
    return <div>フィードバック取得中...</div>;
  }
  if (props.feedbackList.length === 0) {
    return <div>フィードバックはまだありません</div>;
  }
  return (
    <div>
      {props.feedbackList.map((feedback) => (
        <div key={feedback.accountId}>{feedback.message}</div>
      ))}
    </div>
  );
};

const AnswerList = (props: {
  answersFromOtherStudents:
    | ReadonlyArray<d.AnswersFromOtherStudent>
    | undefined;
}): React.ReactElement => {
  if (props.answersFromOtherStudents === undefined) {
    return <div>他の人の回答取得中...</div>;
  }
  if (props.answersFromOtherStudents.length === 0) {
    return <div>他の人の回答はまだありません</div>;
  }
  return (
    <div>
      {props.answersFromOtherStudents.map((answer) => (
        <div key={answer.studentId}>{answer.answerText}</div>
      ))}
    </div>
  );
};
