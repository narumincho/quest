import * as React from "react";
import * as d from "../../data";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { Send } from "@mui/icons-material";
import { imageUrl } from "../../common/url";

export const CommentAndAnswersFromOtherStudents = (props: {
  readonly appSate: AppState;
  readonly classId: d.ClassId;
  readonly questionId: d.QuestionId;
  readonly loggedInState: LoggedInState;
  readonly answerStudentId: d.AccountId;
}): React.ReactElement => {
  const [selectedTab, setSelectedTab] = React.useState<
    "comment" | "answersFromOtherStudents"
  >("comment");
  const [answersFromOtherStudents, setAnswersFromOtherStudents] =
    React.useState<ReadonlyArray<d.AnswersFromOtherStudent> | undefined>(
      undefined
    );
  const [commentList, setCommentList] = React.useState<
    ReadonlyArray<d.Feedback> | undefined
  >(undefined);
  const [isSubmittingComment, setIsSubmittingComment] =
    React.useState<boolean>(false);
  const [commentEditText, setCommentEditText] = React.useState<string>("");

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
      .requestComment({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
        answerStudentId: props.answerStudentId,
      })
      .then((response) => {
        setCommentList(response);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.classId, props.questionId, props.answerStudentId]);

  const submitFeedback = (): void => {
    setIsSubmittingComment(true);
    props.appSate
      .addComment({
        accountToken: props.loggedInState.accountToken,
        classId: props.classId,
        questionId: props.questionId,
        answerStudentId: props.answerStudentId,
        message: commentEditText,
      })
      .then((response) => {
        if (response !== undefined) {
          setCommentEditText("");
          setCommentList(response);
        }
        setIsSubmittingComment(false);
      });
  };

  return (
    <Box padding={1}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab === "comment" ? 0 : 1}
          onChange={(_, v) => {
            setSelectedTab(v === 0 ? "comment" : "answersFromOtherStudents");
          }}
          variant="fullWidth"
        >
          <Tab label="受け取ったコメント" />
          <Tab label="他の人の回答" />
        </Tabs>
      </Box>
      <Box padding={1}>
        {selectedTab === "comment" ? (
          <FeedbackListWithInput
            feedbackList={commentList}
            onSubmitFeedback={submitFeedback}
            classId={props.classId}
            loggedInState={props.loggedInState}
            commentEditText={commentEditText}
            onChangeCommentEditText={setCommentEditText}
            isSubmittingComment={isSubmittingComment}
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
  readonly onSubmitFeedback: () => void;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly commentEditText: string;
  readonly onChangeCommentEditText: (comment: string) => void;
  readonly isSubmittingComment: boolean;
}): React.ReactElement => {
  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    props.onChangeCommentEditText(event.target.value);
  };
  const isNotEmpty = props.commentEditText.trim().length === 0;
  return (
    <div>
      <TextField
        multiline
        required
        fullWidth
        label="この回答に対するコメント"
        value={props.commentEditText}
        onChange={onChange}
        variant="outlined"
        disabled={props.isSubmittingComment}
      />
      <Button
        fullWidth
        onClick={(): void => {
          props.onSubmitFeedback();
        }}
        size="large"
        disabled={isNotEmpty || props.isSubmittingComment}
        variant="contained"
        color="secondary"
        startIcon={props.isSubmittingComment ? <CircularProgress /> : <Send />}
      >
        送信
      </Button>
      <CommentList
        commentList={props.feedbackList}
        classId={props.classId}
        loggedInState={props.loggedInState}
      />
    </div>
  );
};

const CommentList = (props: {
  readonly commentList: ReadonlyArray<d.Feedback> | undefined;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  if (props.commentList === undefined) {
    return <div>コメント取得中...</div>;
  }
  if (props.commentList.length === 0) {
    return <div>コメントはまだありません</div>;
  }
  const participantList: ReadonlyArray<d.Participant> =
    props.loggedInState.joinedClassMap.get(props.classId)?.participantList ??
    [];
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        padding: 1,
      }}
    >
      {props.commentList.map((comment, index) => {
        const account: d.Account | undefined = participantList.find(
          (participant) => participant.account.id === comment.accountId
        )?.account;
        return (
          <Paper key={index} sx={{ padding: 1 }}>
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
            {comment.message}
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
    <Box
      sx={{
        display: "grid",
        gap: 1,
        padding: 1,
      }}
    >
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
            <Paper sx={{ padding: 1 }}>
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
