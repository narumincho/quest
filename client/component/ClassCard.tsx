import * as React from "react";
import * as d from "../../data";
import { Paper, Typography } from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";

export const ClassCard = (props: {
  readonly class: d.AdminClass;
  readonly appState: AppState;
}): React.ReactElement => {
  return (
    <Link appState={props.appState} location={d.Location.Class(props.class.id)}>
      <Paper
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          padding: 2,
        }}
      >
        <Typography>{props.class.name}</Typography>
      </Paper>
    </Link>
  );
};
