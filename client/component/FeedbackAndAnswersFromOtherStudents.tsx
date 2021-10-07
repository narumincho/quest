import * as React from "react";
import * as d from "../../data";
import {
  Avatar,
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { Send } from "@material-ui/icons";
import { imageUrl } from "../../common/url";

export const FeedbackAndAnswersFromOtherStudents = (props: {
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
          <Tab label="受け取ったコメント" />
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
        label="この回答に対するコメント"
        value={feedbackEditText}
        onChange={onChange}
        variant="outlined"
      />
      <Button
        fullWidth
        onClick={(): void => {
          props.onSubmitFeedback(feedbackEditText);
        }}
        size="large"
        disabled={isNotEmpty}
        variant="contained"
        color="secondary"
        startIcon={<Send />}
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
    return <div>コメント取得中...</div>;
  }
  if (props.feedbackList.length === 0) {
    return <div>コメントはまだありません</div>;
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
