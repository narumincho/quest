import * as React from "react";
import { CallState, LineLoginButton as Pure } from "../ui/LineLoginButton";
import { api } from "../api";
import { useSnackbar } from "notistack";

type Props = Record<never, never>;

export const LineLogInButton: React.FunctionComponent<Props> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [callState, setCallState] = React.useState<CallState>("notCalled");

  const call = () => {
    setCallState("calling");
    api.requestLineLoginUrl(undefined).then((response) => {
      if (response._ === "Error") {
        enqueueSnackbar(
          `LINEログインのURLを発行できなかった ${response.error}`,
          { variant: "error" }
        );
        return;
      }
      location.href = response.ok;
      setCallState("jumping");
    });
  };

  return <Pure callState={callState} onClick={call} />;
};
