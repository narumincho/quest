import * as React from "react";
import * as d from "../data";
import { AppState, LoggedInState, useAppState } from "./state";
import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import { AdminClassPage } from "./component/AdminClassPage";
import { AdminTopPage } from "./component/AdminTopPage";
import { ClassInvitationPage } from "./component/ClassInvitationPage";
import { ClassNewPage } from "./component/ClassNewPage";
import { Link } from "./component/Link";
import { LoadingPage } from "./component/LoadingPage";
import { LogInPage } from "./component/LogInPage";
import { PageContainer } from "./component/PageContainer";
import { ParticipantClassPage } from "./component/ParticipantClassPage";
import { ProgramNewPage } from "./component/ProgramNewPage";
import { ProgramPage } from "./component/ProgramPage";
import { QuestionEditPage } from "./component/QuestionEditPage";
import { QuestionNewPage } from "./component/QuestionNewPage";
import { QuestionPage } from "./component/QuestionPage";
import { SettingPage } from "./component/SettingPage";

export const App: React.VFC<Record<never, never>> = React.memo(() => {
  const appState = useAppState();

  switch (appState.logInState.tag) {
    case "LoggedIn":
      return (
        <LoggedIn
          loggedInState={appState.logInState.loggedInState}
          appState={appState}
        />
      );
    case "NoLogin":
    case "RequestingLogInUrl":
    case "JumpingPage":
      return <LogInPage appState={appState} />;
    default:
      return <LoadingPage />;
  }
});
App.displayName = "QuestApp";

const LoggedIn: React.VFC<{
  readonly loggedInState: LoggedInState;
  readonly appState: AppState;
}> = React.memo((props) => {
  const location = props.appState.location;
  switch (location._) {
    case "Top":
      return (
        <AdminTopPage
          appState={props.appState}
          loggedInState={props.loggedInState}
        />
      );
    case "Setting":
      return (
        <SettingPage
          account={props.loggedInState.account}
          appState={props.appState}
        />
      );
    case "NewProgram":
      return <ProgramNewPage appState={props.appState} />;
    case "Program":
      return (
        <ProgramPage
          programId={location.qProgramId}
          appState={props.appState}
        />
      );
    case "NewQuestion":
      return (
        <QuestionNewPage
          appState={props.appState}
          programId={location.qNewQuestionParameter.programId}
          parent={
            location.qNewQuestionParameter.parent._ === "Just"
              ? location.qNewQuestionParameter.parent.value
              : undefined
          }
        />
      );
    case "Question":
      return (
        <QuestionPage
          questionId={location.qQuestionId}
          appState={props.appState}
        />
      );
    case "NewClass":
      return (
        <ClassNewPage a={props.appState} programId={location.qProgramId} />
      );
    case "Class": {
      return (
        <ClassPage appState={props.appState} classId={location.qClassId} />
      );
    }
    case "ClassInvitation":
      return (
        <ClassInvitationPage
          appState={props.appState}
          classInvitationToken={location.qClassInvitationToken}
        />
      );
    case "EditQuestion":
      return (
        <QuestionEditPage
          appState={props.appState}
          questionId={location.qQuestionId}
        />
      );
  }
});
LoggedIn.displayName = "LoggedIn";

export const ClassPage: React.VFC<{ appState: AppState; classId: d.QClassId }> =
  (props) => {
    const classAndRole = props.appState.getClassAndRole(props.classId);
    switch (classAndRole.tag) {
      case "none":
        return (
          <PageContainer appState={props.appState}>
            <Box>
              このクラスは, 存在していないか, 参加または作成していません
            </Box>
            <Box padding={1}>
              <Box padding={1}>
                <Breadcrumbs>
                  <Link appState={props.appState} location={d.QLocation.Top}>
                    作成したプログラム
                  </Link>
                  <div></div>
                </Breadcrumbs>
              </Box>
            </Box>
            <Box padding={1}>
              <Typography>クラスID: {props.classId}</Typography>
            </Box>
          </PageContainer>
        );
      case "admin":
        return (
          <AdminClassPage a={props.appState} qClass={classAndRole.qClass} />
        );
      case "participant":
        return <ParticipantClassPage classId={props.classId} />;
    }
  };
