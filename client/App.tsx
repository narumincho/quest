import * as React from "react";
import * as d from "../data";
import { AppState, useAppState } from "./state";
import { AdminTop } from "./page/AdminTop";
import { Loading } from "./page/Loading";
import { Login } from "./page/Login";
import { NewProgram } from "./page/NewProgram";
import { Program } from "./page/Program";
import { Setting } from "./page/Setting";
import { NewQuestion } from "./page/NewQuestion";
import { Question } from "./page/Question";

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
  switch (props.appState.location._) {
    case "Top":
      return <AdminTop appState={props.appState} />;
    case "Setting":
      return <Setting account={props.account} appState={props.appState} />;
    case "NewProgram":
      return <NewProgram appState={props.appState} />;
    case "Program":
      return (
        <Program
          programId={props.appState.location.qProgramId}
          appState={props.appState}
        />
      );
    case "NewQuestion":
      return <NewQuestion appState={props.appState} />;
    case "Question":
      return (
        <Question
          questionId={props.appState.location.qQuestionId}
          appState={props.appState}
        />
      );
  }
};
