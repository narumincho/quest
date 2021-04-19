import * as React from "react";
import * as d from "../data";
import { AppState, useAppState } from "./state";
import { AdminTop } from "./page/AdminTop";
import { Class } from "./page/Class";
import { ClassInvitation } from "./page/ClassInvitation";
import { EditQuestion } from "./page/EditQuestion";
import { Loading } from "./page/Loading";
import { Login } from "./page/Login";
import { NewClass } from "./page/NewClass";
import { NewProgram } from "./page/NewProgram";
import { NewQuestion } from "./page/NewQuestion";
import { Program } from "./page/Program";
import { Question } from "./page/Question";
import { Setting } from "./page/Setting";

export const App: React.VFC<Record<never, never>> = () => {
  const appState = useAppState();

  switch (appState.loginState.tag) {
    case "LoggedIn":
      return (
        <LoggedIn
          accountToken={appState.loginState.accountToken}
          account={appState.loginState.account}
          appState={appState}
        />
      );
    case "NoLogin":
    case "RequestingLoginUrl":
    case "JumpingPage":
      return <Login appState={appState} />;
    default:
      return <Loading />;
  }
};

const LoggedIn: React.VFC<{
  accountToken: d.AccountToken;
  account: d.QAccount;
  appState: AppState;
}> = (props) => {
  const location = props.appState.location;
  switch (location._) {
    case "Top":
      return <AdminTop appState={props.appState} />;
    case "Setting":
      return <Setting account={props.account} appState={props.appState} />;
    case "NewProgram":
      return <NewProgram appState={props.appState} />;
    case "Program":
      return (
        <Program programId={location.qProgramId} appState={props.appState} />
      );
    case "NewQuestion":
      return (
        <NewQuestion
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
        <Question questionId={location.qQuestionId} appState={props.appState} />
      );
    case "NewClass":
      return <NewClass a={props.appState} programId={location.qProgramId} />;
    case "Class":
      return <Class a={props.appState} classId={location.qClassId} />;
    case "ClassInvitation":
      return (
        <ClassInvitation
          classInvitationToken={location.qClassInvitationToken}
        />
      );
    case "EditQuestion":
      return (
        <EditQuestion
          appState={props.appState}
          questionId={location.qQuestionId}
        />
      );
  }
};
