import * as React from "react";
import * as d from "../../data";
import {
  Badge,
  Box,
  Breadcrumbs,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import {
  dateTimeToMillisecondsSinceUnixEpoch,
  dateTimeToString,
} from "../../common/dateTime";
import { AccountCardFromData } from "./AccountCard";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";

type NotificationList = "loading" | "error" | ReadonlyArray<d.Notification>;

export const NotificationPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const [notificationList, setNotificationList] =
    React.useState<NotificationList>("loading");

  React.useEffect(() => {
    props.appState
      .getNotificationList(props.loggedInState.accountToken)
      .then((response) => {
        if (response === undefined) {
          setNotificationList("error");
          return;
        }
        setNotificationList(response);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div></div>
        </Breadcrumbs>
      </Box>
      <Box padding={1}>
        <Typography variant="h5">通知</Typography>
      </Box>
      <NotificationContent
        notificationList={notificationList}
        appState={props.appState}
        loggedInState={props.loggedInState}
      />
    </PageContainer>
  );
};

const NotificationContent = (props: {
  readonly notificationList: NotificationList;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  switch (props.notificationList) {
    case "loading":
      return <CircularProgress />;
    case "error":
      return (
        <Box padding={1}>
          <Typography>通知の取得に失敗しました</Typography>
        </Box>
      );
  }
  if (props.notificationList.length === 0) {
    return (
      <Box padding={1}>
        <Typography>通知はまだ, 1つもありません</Typography>
      </Box>
    );
  }
  return (
    <Box display="grid" padding={1} gap={1}>
      {[...props.notificationList]
        .sort(
          (a, b) =>
            dateTimeToMillisecondsSinceUnixEpoch(b.createTime) -
            dateTimeToMillisecondsSinceUnixEpoch(a.createTime)
        )
        .map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
            appState={props.appState}
            loggedInState={props.loggedInState}
          />
        ))}
    </Box>
  );
};

const NotificationItem = (props: {
  readonly notification: d.Notification;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const event = props.notification.event;
  switch (event._) {
    case "NewComment":
      return (
        <NotificationItemContainer
          appState={props.appState}
          location={d.Location.StudentAnswer({
            answerStudentId: event.commentMain.answerStudent.id,
            classId: event.commentMain.class.id,
            questionId: event.commentMain.question.id,
          })}
          done={props.notification.done}
          notificationId={props.notification.id}
          accountToken={props.loggedInState.accountToken}
        >
          <Typography>
            クラス 「{event.commentMain.class.name}」 の質問「
            {event.commentMain.question.name}」対して
          </Typography>
          <AccountCardFromData account={event.commentMain.answerStudent} />
          <Typography>が回答した回答に対して</Typography>
          <AccountCardFromData account={event.commentMain.account} />
          <Typography>
            が「{event.commentMain.message}」とコメントしました
          </Typography>
          <Typography align="right">
            {dateTimeToString(props.notification.createTime)}
          </Typography>
        </NotificationItemContainer>
      );
    case "NewAnswer":
      return (
        <NotificationItemContainer
          appState={props.appState}
          location={d.Location.StudentAnswer({
            answerStudentId: event.answerMain.answerStudent.id,
            classId: event.answerMain.class.id,
            questionId: event.answerMain.question.id,
          })}
          done={props.notification.done}
          notificationId={props.notification.id}
          accountToken={props.loggedInState.accountToken}
        >
          <Typography>
            クラス 「{event.answerMain.class.name}」 の質問「
            {event.answerMain.question.name}」対して
          </Typography>
          <AccountCardFromData account={event.answerMain.answerStudent} />
          <Typography>
            が「{event.answerMain.answerText}」と答えました
          </Typography>
          <Typography align="right">
            {dateTimeToString(props.notification.createTime)}
          </Typography>
        </NotificationItemContainer>
      );
  }
};

const NotificationItemContainer = (props: {
  readonly children: React.ReactNode;
  readonly appState: AppState;
  readonly location: d.Location;
  readonly done: boolean;
  readonly notificationId: d.NotificationId;
  readonly accountToken: d.AccountToken;
}): React.ReactElement => {
  return (
    <Link
      appState={props.appState}
      location={props.location}
      onClick={() => {
        props.appState.setNotificationDone(
          props.notificationId,
          props.accountToken
        );
      }}
    >
      <Badge
        color="secondary"
        badgeContent={props.done ? 0 : " "}
        sx={{ display: "gird", width: "100%" }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper
          sx={{
            padding: 1,
            display: "gird",
            width: "100%",
          }}
          elevation={props.done ? 1 : 4}
        >
          {props.children}
        </Paper>
      </Badge>
    </Link>
  );
};
