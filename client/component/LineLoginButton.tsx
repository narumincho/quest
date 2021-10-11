import * as React from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { AppState } from "../state";

export type CallState = "notCalled" | "calling" | "jumping";

export const LineLoginButton = (props: {
  readonly appState: AppState;
}): React.ReactElement => {
  switch (props.appState.logInState.tag) {
    case "NoLogin":
      return (
        <LineLoginButtonPrim onClickOrDisabled={props.appState.requestLogin}>
          <img
            style={{
              display: "grid",
              width: 44,
              height: 44,
              padding: 4,
            }}
            src="/line_icon120.png"
          />
          <Typography
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              display: "grid",
              alignContent: "center",
            }}
          >
            LINE で ログイン
          </Typography>
        </LineLoginButtonPrim>
      );
    case "RequestingLogInUrl":
      return (
        <LineLoginButtonPrim onClickOrDisabled="disabled">
          ログイン準備中……
        </LineLoginButtonPrim>
      );
    case "JumpingPage":
      return (
        <LineLoginButtonPrim onClickOrDisabled="disabled">
          画面推移中……
        </LineLoginButtonPrim>
      );
  }

  return (
    <LineLoginButtonPrim onClickOrDisabled="disabled">
      準備中
    </LineLoginButtonPrim>
  );
};

const LineLoginButtonPrim = (props: {
  readonly children: React.ReactNode;
  readonly onClickOrDisabled: (() => void) | "disabled";
  readonly onHover?: (() => void) | undefined;
}): React.ReactElement => {
  return (
    <Button
      variant="contained"
      disabled={props.onClickOrDisabled === "disabled"}
      sx={{
        background: "#06c755",
        color: "#fff",
        "&:hover": {
          background: "#05b34c",
        },
        padding: 0,
        display: "flex",
        width: "100%",
      }}
      startIcon={
        props.onClickOrDisabled === "disabled" ? <CircularProgress /> : <></>
      }
      onClick={() => {
        if (typeof props.onClickOrDisabled !== "string") {
          props.onClickOrDisabled();
        }
      }}
    >
      {props.children}
    </Button>
  );
};
