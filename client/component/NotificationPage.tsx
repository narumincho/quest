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
import { AccountCard } from "./AccountCard";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";

type NotificationList = "loading" | "error" | ReadonlyArray<d.Notification>;

export const NotificationPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
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
    <PageContainer appState={props.appState}>
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
      {props.notificationList.map((item) => (
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
  switch (props.notification.event._) {
    case "ConfirmAnswerInCreatedClass":
      return (
        <NotificationItemContainer
          appState={props.appState}
          location={d.Location.StudentAnswer(
            props.notification.event.answerIdData
          )}
          done={props.notification.done}
        >
          <Typography>自分のクラスの</Typography>
          <AccountCard
            loggedInState={props.loggedInState}
            accountId={props.notification.event.answerIdData.answerStudentId}
          />
          <Typography>が回答しました</Typography>
        </NotificationItemContainer>
      );
    case "NewCommentInCreatedClass":
      return (
        <NotificationItemContainer
          appState={props.appState}
          location={d.Location.StudentAnswer(
            props.notification.event.answerIdData
          )}
          done={props.notification.done}
        >
          <Typography>自分のクラスの</Typography>
          <AccountCard
            loggedInState={props.loggedInState}
            accountId={props.notification.event.answerIdData.answerStudentId}
          />
          <Typography>がコメントしました</Typography>
        </NotificationItemContainer>
      );
    case "NewCommentToMyAnswer":
      return (
        <NotificationItemContainer
          appState={props.appState}
          location={d.Location.StudentAnswer(
            props.notification.event.answerIdData
          )}
          done={props.notification.done}
        >
          <Typography>自分の回答に</Typography>
          <AccountCard
            loggedInState={props.loggedInState}
            accountId={props.notification.event.answerIdData.answerStudentId}
          />
          <Typography>からコメントがつけられました!</Typography>
        </NotificationItemContainer>
      );
  }
};

const NotificationItemContainer = (props: {
  readonly children: React.ReactNode;
  readonly appState: AppState;
  readonly location: d.Location;
  readonly done: boolean;
}): React.ReactElement => {
  return (
    <Link appState={props.appState} location={props.location}>
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
