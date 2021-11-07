import * as React from "react";
import * as d from "../../data";
import { Box, Button, CircularProgress, Paper, Tab, Tabs } from "@mui/material";
import { AccountCard } from "./AccountCard";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { Send } from "@mui/icons-material";
import { TextEditor } from "./TextEditor";
import { dateTimeToMillisecondsSinceUnixEpoch } from "../../common/dateTime";

export const CommentAndAnswersFromOtherStudents = (props: {
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly questionId: d.QuestionId;
  readonly loggedInState: LoggedInState;
  readonly answerStudentId: d.AccountId;
  readonly answersFromOtherStudents:
    | ReadonlyArray<d.AnswersFromOtherStudent>
    | undefined;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [selectedTab, setSelectedTab] = React.useState<
    "comment" | "answersFromOtherStudents"
  >("comment");
  const [answersFromOtherStudents, setAnswersFromOtherStudents] =
    React.useState<ReadonlyArray<d.AnswersFromOtherStudent> | undefined>(
      props.answersFromOtherStudents
    );
  const [commentList, setCommentList] = React.useState<
    ReadonlyArray<d.Comment> | undefined
  >(undefined);
  const [isSubmittingComment, setIsSubmittingComment] =
    React.useState<boolean>(false);
  const [commentEditText, setCommentEditText] = React.useState<string>("");

  React.useEffect(() => {
    if (props.answersFromOtherStudents === undefined) {
      props.appState
        .requestAnswersFromOtherStudents({
          accountToken: props.loggedInState.accountToken,
          classId: props.classId,
          questionId: props.questionId,
        })
        .then((response) => {
          setAnswersFromOtherStudents(response);
        });
    }

    props.appState
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
    props.appState
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
            isDarkMode={props.isDarkMode}
          />
        ) : (
          <AnswerList
            answersFromOtherStudents={answersFromOtherStudents}
            classId={props.classId}
            questionId={props.questionId}
            appState={props.appState}
            loggedInState={props.loggedInState}
            extractStudentId={props.answerStudentId}
          />
        )}
      </Box>
    </Box>
  );
};

const FeedbackListWithInput = (props: {
  readonly feedbackList: ReadonlyArray<d.Comment> | undefined;
  readonly onSubmitFeedback: () => void;
  readonly classId: d.ClassId;
  readonly loggedInState: LoggedInState;
  readonly commentEditText: string;
  readonly onChangeCommentEditText: (comment: string) => void;
  readonly isSubmittingComment: boolean;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const isNotEmpty = props.commentEditText.trim().length === 0;
  return (
    <div>
      <TextEditor
        multiline
        label="この回答に対するコメント"
        value={props.commentEditText}
        onChangeOrReadonlyOrDisabled={
          props.isSubmittingComment ? "disabled" : props.onChangeCommentEditText
        }
        helperText=""
        error={false}
        isDarkMode={props.isDarkMode}
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
  readonly commentList: ReadonlyArray<d.Comment> | undefined;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  if (props.commentList === undefined) {
    return <div>コメント取得中...</div>;
  }
  if (props.commentList.length === 0) {
    return <div>コメントはまだありません</div>;
  }
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        padding: 1,
      }}
    >
      {[...props.commentList]
        .sort(
          (a, b) =>
            dateTimeToMillisecondsSinceUnixEpoch(b.createDateTime) -
            dateTimeToMillisecondsSinceUnixEpoch(a.createDateTime)
        )
        .map((comment) => {
          return (
            <Paper key={comment.id} sx={{ padding: 1 }}>
              <AccountCard
                accountId={comment.accountId}
                loggedInState={props.loggedInState}
              />
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
                <AccountCard
                  accountId={account.id}
                  loggedInState={props.loggedInState}
                />
              )}
              {answer.answerText}
            </Paper>
          </Link>
        );
      })}
    </Box>
  );
};
