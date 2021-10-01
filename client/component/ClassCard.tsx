import * as React from "react";
import * as d from "../../data";
import { Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 16,
  },
});

export const ClassCard = (props: {
  readonly class: d.AdminClass;
  readonly appState: AppState;
}): React.ReactElement => {
  const classes = useStyles();
  return (
    <Link appState={props.appState} location={d.Location.Class(props.class.id)}>
      <Paper className={classes.card}>
        <Typography>{props.class.name}</Typography>
      </Paper>
    </Link>
  );
};
