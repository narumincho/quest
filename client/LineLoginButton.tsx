import * as React from "react";
import { Button } from "@material-ui/core";
import { api } from "./api";

type Props = Record<never, never>;

type CallState = "notCalled" | "preCalling" | "calling";

export const LineLogInButton: React.FunctionComponent<Props> = () => {
  const [callState, setCallState] = React.useState<CallState>("notCalled");
  React.useEffect(() => {
    switch (callState) {
      case "preCalling": {
        setCallState("calling");
        api.requestLineLoginUrl(undefined).then((response) => {
          setCallState("notCalled");
          if (response._ === "Just") {
            location.href = response.value;
          }
        });
      }
    }
  }, [callState]);
  return (
    <Button
      variant="contained"
      onClick={() => {
        setCallState("preCalling");
      }}
      disabled={callState !== "notCalled"}
    >
      {callState === "notCalled" ? "LINE で ログイン" : "ログインリクエスト中"}
    </Button>
  );
};
