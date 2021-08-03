import * as React from "react";
import * as d from "../../data";
import { Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";

export type Props = {
  readonly class: d.QClass;
  readonly appState: AppState;
};

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 16,
  },
});

export const ClassCard: React.VFC<Props> = (props) => {
  const classes = useStyles();
  return (
    <Link
      appState={props.appState}
      location={d.QLocation.Class(props.class.id)}
    >
      <Paper className={classes.card}>
        <Typography>{props.class.name}</Typography>
      </Paper>
    </Link>
  );
};
