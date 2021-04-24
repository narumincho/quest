import * as React from "react";
import * as d from "../../data";
import { Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";

export type Props = {
  readonly programId: d.QProgramId;
  readonly appState: AppState;
};

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: "32px 16px",
  },
});

export const ProgramCard: React.VFC<Props> = (props) => {
  const classes = useStyles();
  const program = props.appState.program(props.programId);
  if (program === undefined) {
    return (
      <Link
        appState={props.appState}
        location={d.QLocation.Program(props.programId)}
      >
        プログラムの情報を読込中
      </Link>
    );
  }
  return (
    <Link
      appState={props.appState}
      location={d.QLocation.Program(props.programId)}
    >
      <Paper className={classes.card}>
        <Typography>{program.name}</Typography>
      </Paper>
    </Link>
  );
};
