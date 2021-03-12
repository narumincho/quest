import * as React from "react";
import { CallState, LineLoginButton as Pure } from "../ui/LineLoginButton";
import { AppState } from "../state";
import { api } from "../api";

export type Props = {
  appState: AppState;
};

export const LineLogInButton: React.FunctionComponent<Props> = (props) => {
  const [callState, setCallState] = React.useState<CallState>("notCalled");

  const call = () => {
    setCallState("calling");
    api.requestLineLoginUrl(undefined).then((response) => {
      if (response._ === "Error") {
        props.appState.addNotification(
          `LINEログインのURLを発行できなかった ${response.error}`,
          "error"
        );
        return;
      }
      location.href = response.ok;
      setCallState("jumping");
    });
  };

  return <Pure callState={callState} onClick={call} />;
};
