import * as React from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import { api } from "./api";
import { useSnackbar } from "notistack";

type Props = Record<never, never>;

type CallState = "notCalled" | "preCalling" | "calling" | "jumping";

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

export const LineLogInButton: React.FunctionComponent<Props> = () => {
  const classes = useStyle();
  const { enqueueSnackbar } = useSnackbar();
  const [callState, setCallState] = React.useState<CallState>("notCalled");

  React.useEffect(() => {
    switch (callState) {
      case "preCalling": {
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
      }
    }
  }, [callState]);
  if (callState === "notCalled") {
    return (
      <Button
        variant="contained"
        onClick={() => {
          setCallState("preCalling");
        }}
        disabled={callState !== "notCalled"}
        className={classes.button}
      >
        <img src="/line_icon120.png" className={classes.lineIcon} />
        <div className={classes.text}>LINE で ログイン</div>
      </Button>
    );
  }
  return (
    <Button variant="contained" disabled className={classes.button}>
      <CircularProgress />
    </Button>
  );
};
