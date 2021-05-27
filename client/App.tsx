import * as React from "react";
import * as d from "../data";
import { AppState, LoggedInState, useAppState } from "./state";
import { AdminTopPage } from "./component/AdminTopPage";
import { ClassInvitationPage } from "./component/ClassInvitationPage";
import { ClassNewPage } from "./component/ClassNewPage";
import { ClassPage } from "./component/ClassPage";
import { LoadingPage } from "./component/LoadingPage";
import { LogInPage } from "./component/LogInPage";
import { ProgramNewPage } from "./component/ProgramNewPage";
import { ProgramPage } from "./component/ProgramPage";
import { QuestionEditPage } from "./component/QuestionEditPage";
import { QuestionNewPage } from "./component/QuestionNewPage";
import { QuestionPage } from "./component/QuestionPage";
import { SettingPage } from "./component/SettingPage";

export const App: React.VFC<Record<never, never>> = () => {
  const appState = useAppState();

  switch (appState.loginState.tag) {
    case "LoggedIn":
      return (
        <LoggedIn
          loggedInState={appState.loginState.loggedInState}
          appState={appState}
        />
      );
    case "NoLogin":
    case "RequestingLoginUrl":
    case "JumpingPage":
      return <LogInPage appState={appState} />;
    default:
      return <LoadingPage />;
  }
};

const LoggedIn: React.VFC<{
  loggedInState: LoggedInState;
  appState: AppState;
}> = (props) => {
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
    case "Class":
      return <ClassPage a={props.appState} classId={location.qClassId} />;
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
};
