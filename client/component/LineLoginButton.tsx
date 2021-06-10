import * as React from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import { AppState } from "../state";

export type CallState = "notCalled" | "calling" | "jumping";

export type Props = {
  readonly appState: AppState;
};

const useStyle = makeStyles({
  button: {
    background: "#00c300",
    color: "#fff",
    "&:hover": {
      background: "#00e000",
    },
    padding: 0,
    display: "flex",
    width: "100%",
  },
  lineIcon: {
    display: "grid",
    width: 44,
    height: 44,
    borderRight: "1px solid #00b300",
    padding: 4,
    "&:hover": {
      borderRightColor: "#009800",
    },
  },
  text: {
    flexGrow: 1,
    fontWeight: "bold",
  },
});

export const LineLoginButton: React.VFC<Props> = (props) => {
  const classes = useStyle();
  switch (props.appState.logInState.tag) {
    case "NoLogin":
      return (
        <Button
          variant="contained"
          onClick={props.appState.requestLogin}
          className={classes.button}
        >
          <img src="/line_icon120.png" className={classes.lineIcon} />
          <div className={classes.text}>LINE で ログイン</div>
        </Button>
      );
    case "RequestingLoginUrl":
      return (
        <Button
          variant="contained"
          disabled
          className={classes.button}
          startIcon={<CircularProgress />}
        >
          ログイン準備中……
        </Button>
      );
    case "JumpingPage":
      return (
        <Button
          variant="contained"
          disabled
          className={classes.button}
          startIcon={<CircularProgress />}
        >
          画面推移中……
        </Button>
      );
  }

  return (
    <Button
      variant="contained"
      disabled
      className={classes.button}
      startIcon={<CircularProgress />}
    >
      準備中
    </Button>
  );
};
