import * as React from "react";
import * as d from "../../data";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Publish, Save } from "@material-ui/icons";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";
import { imageUrl } from "../../common/url";
import { stringToValidAnswerText } from "../../common/validation";
import { studentSelfQuestionTreeListFind } from "../../common/studentSelfQuestionTree";

export const StudentAnswerPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly answerIdData: d.AnswerIdData;
}): React.ReactElement => {
  const questionTreeList = props.appState.getStudentQuestionTree(
    props.answerIdData.classId
  );

  if (questionTreeList === undefined) {
    return (
      <NotFoundQuestion
        appState={props.appState}
        classId={props.answerIdData.classId}
      />
    );
  }
  const question = studentSelfQuestionTreeListFind(
    questionTreeList,
    props.answerIdData.questionId
  );

  if (question === undefined) {
    return (
      <NotFoundQuestion
        appState={props.appState}
        classId={props.answerIdData.classId}
      />
    );
  }

  if (props.loggedInState.account.id === props.answerIdData.answerStudentId) {
    return (
      <StudentSelfEditQuestionPageLoaded
        question={question}
        appState={props.appState}
        classId={props.answerIdData.classId}
        loggedInState={props.loggedInState}
        loggedInAccountId={props.loggedInState.account.id}
      />
    );
  }
  return (
    <PageLoadedOtherStudentView
      question={question}
      appState={props.appState}
      classId={props.answerIdData.classId}
      answerStudentId={props.answerIdData.answerStudentId}
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

const StudentSelfEditQuestionPageLoaded = (props: {
  readonly question: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly loggedInAccountId: d.AccountId;
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
          answerStudentId={props.loggedInAccountId}
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
  readonly question: d.StudentSelfQuestionTree;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly answerStudentId: d.AccountId;
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
    </PageContainer>
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

  const submitFeedback = (message: string): void => {
    props.appSate
      .addFeedback({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
        answerStudentId: props.answerStudentId,
        message,
      })
      .then((response) => {
        setFeedbackList(response);
      });
  };

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
          <FeedbackListWithInput
            feedbackList={feedbackList}
            onSubmitFeedback={submitFeedback}
            classId={props.classId}
            loggedInState={props.loggedInState}
          />
        ) : (
          <AnswerList
            answersFromOtherStudents={answersFromOtherStudents}
            classId={props.classId}
            questionId={props.questionId}
            appState={props.appSate}
            loggedInState={props.loggedInState}
            extractStudentId={props.answerStudentId}
          />
        )}
      </Box>
    </Box>
  );
};

const FeedbackListWithInput = (props: {
  readonly feedbackList: ReadonlyArray<d.Feedback> | undefined;
  readonly onSubmitFeedback: (message: string) => void;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const [feedbackEditText, setFeedbackEditText] = React.useState<string>("");
  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFeedbackEditText(event.target.value);
  };
  const isNotEmpty = feedbackEditText.trim().length === 0;
  return (
    <div>
      <TextField
        multiline
        required
        fullWidth
        label="この回答に対するフィードバック"
        value={feedbackEditText}
        onChange={onChange}
        variant="outlined"
      />
      <Button
        fullWidth
        onClick={() => props.onSubmitFeedback(feedbackEditText)}
        size="large"
        disabled={isNotEmpty}
        variant="contained"
        color="secondary"
        startIcon={<Publish />}
      >
        送信
      </Button>
      <FeedbackList
        feedbackList={props.feedbackList}
        classId={props.classId}
        loggedInState={props.loggedInState}
      />
    </div>
  );
};

const useStyles = makeStyles({
  list: {
    display: "grid",
    gap: 8,
    padding: 8,
  },
  item: {
    padding: 8,
  },
});

const FeedbackList = (props: {
  readonly feedbackList: ReadonlyArray<d.Feedback> | undefined;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  const classes = useStyles();
  if (props.feedbackList === undefined) {
    return <div>フィードバック取得中...</div>;
  }
  if (props.feedbackList.length === 0) {
    return <div>フィードバックはまだありません</div>;
  }
  const participantList: ReadonlyArray<d.Participant> =
    props.loggedInState.joinedClassMap.get(props.classId)?.participantList ??
    [];
  return (
    <Box className={classes.list}>
      {props.feedbackList.map((feedback, index) => {
        const account: d.Account | undefined = participantList.find(
          (participant) => participant.account.id === feedback.accountId
        )?.account;
        return (
          <Paper key={index} className={classes.item}>
            {account === undefined ? (
              <></>
            ) : (
              <Box display="flex">
                <Avatar
                  alt={account.name}
                  src={imageUrl(account.iconHash).toString()}
                />
                {account.name}
              </Box>
            )}
            {feedback.message}
          </Paper>
        );
      })}
    </Box>
  );
};

const AnswerList = (props: {
  readonly answersFromOtherStudents:
    | ReadonlyArray<d.AnswersFromOtherStudent>
    | undefined;
  readonly classId: d.ClassId;
  readonly questionId: d.QuestionId;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly extractStudentId: d.AccountId;
}): React.ReactElement => {
  const classes = useStyles();
  if (props.answersFromOtherStudents === undefined) {
    return <div>他の人の回答取得中...</div>;
  }
  const filteredList = props.answersFromOtherStudents.filter(
    (answer) => answer.studentId !== props.extractStudentId
  );
  if (filteredList.length === 0) {
    return <div>他の人の回答はまだありません</div>;
  }
  const participantList: ReadonlyArray<d.Participant> =
    props.loggedInState.joinedClassMap.get(props.classId)?.participantList ??
    [];
  return (
    <Box className={classes.list}>
      {filteredList.map((answer) => {
        const account: d.Account | undefined = participantList.find(
          (participant) => participant.account.id === answer.studentId
        )?.account;
        return (
          <Link
            key={answer.studentId}
            location={d.Location.StudentAnswer({
              classId: props.classId,
              questionId: props.questionId,
              answerStudentId: answer.studentId,
            })}
            appState={props.appState}
          >
            <Paper className={classes.item}>
              {account === undefined ? (
                <></>
              ) : (
                <Box display="flex">
                  <Avatar
                    alt={account.name}
                    src={imageUrl(account.iconHash).toString()}
                  />
                  {account.name}
                </Box>
              )}
              {answer.answerText}
            </Paper>
          </Link>
        );
      })}
    </Box>
  );
};
