import * as React from "react";
import * as d from "../../data";
import { Box, Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";

export type Props = {
  readonly classId: d.QClassId;
  readonly a: AppState;
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
  const qClass = props.a.getClass(props.classId);
  if (qClass === undefined) {
    return <Box>クラスの情報を読込中</Box>;
  }
  return (
    <Link appState={props.a} location={d.QLocation.Class(props.classId)}>
      <Paper className={classes.card}>
        <Typography>{qClass.name}</Typography>
      </Paper>
    </Link>
  );
};
