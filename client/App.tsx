import * as React from "react";
import * as d from "../data";
import { AppState, LoggedInState, useAppState } from "./state";
import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import { AdminClassPage } from "./component/AdminClassPage";
import { AdminStudentAnswerPage } from "./component/AdminStudentAnswerPage";
import { AdminStudentPage } from "./component/AdminStudentPage";
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
import { StudentEditQuestionPage } from "./component/StudentEditQuestionPage";
import { TopPage } from "./component/TopPage";

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

const LoggedIn = (props: {
  readonly loggedInState: LoggedInState;
  readonly appState: AppState;
}): React.ReactElement => {
  const location = props.appState.location;
  switch (location._) {
    case "Top":
      return (
        <TopPage
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
          programId={location.programId}
          loggedInState={props.loggedInState}
          appState={props.appState}
        />
      );
    case "NewQuestion":
      return (
        <QuestionNewPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          programId={location.newQuestionParameter.programId}
          parent={
            location.newQuestionParameter.parent._ === "Some"
              ? location.newQuestionParameter.parent.value
              : undefined
          }
        />
      );
    case "AdminQuestion":
      return (
        <QuestionPage
          questionId={location.programIdAndQuestionId.questionId}
          programId={location.programIdAndQuestionId.programId}
          appState={props.appState}
          loggedInState={props.loggedInState}
        />
      );
    case "NewClass":
      return (
        <ClassNewPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          programId={location.programId}
        />
      );
    case "Class": {
      return (
        <ClassPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          classId={location.classId}
        />
      );
    }
    case "ClassInvitation":
      return (
        <ClassInvitationPage
          appState={props.appState}
          studentClassInvitationToken={location.studentClassInvitationToken}
        />
      );
    case "EditQuestion":
      return (
        <QuestionEditPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          questionId={location.programIdAndQuestionId.questionId}
          programId={location.programIdAndQuestionId.programId}
        />
      );
    case "StudentEditQuestion":
      return (
        <StudentEditQuestionPage
          appState={props.appState}
          questionId={location.classIdAndQuestionId.questionId}
          classId={location.classIdAndQuestionId.classId}
        />
      );
    case "AdminStudent":
      return (
        <AdminStudentPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          accountId={location.accountIdAndClassId.accountId}
          classId={location.accountIdAndClassId.classId}
        />
      );
    case "AdminStudentAnswer":
      return <AdminStudentAnswerPage appState={props.appState} />;
  }
};

export const ClassPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
}): React.ReactElement => {
  const classAndRole = props.appState.getClassAndRole(props.classId);
  switch (classAndRole.tag) {
    case "none":
      return (
        <PageContainer appState={props.appState}>
          <Box>このクラスは, 存在していないか, 参加または作成していません</Box>
          <Box padding={1}>
            <Box padding={1}>
              <Breadcrumbs>
                <Link appState={props.appState} location={d.Location.Top}>
                  トップページ
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
        <AdminClassPage
          appState={props.appState}
          loggedInState={props.loggedInState}
          classWithParticipantList={classAndRole.classWithParticipantList}
        />
      );
    case "participant":
      return (
        <ParticipantClassPage
          appState={props.appState}
          joinedClass={classAndRole.joinedClass}
        />
      );
  }
};
