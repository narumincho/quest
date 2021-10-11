import * as React from "react";
import * as d from "../../data";
import { Paper, Typography } from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";
import { ProgramWithClassList } from "../state/loggedInState";

export const ProgramCard = (props: {
  readonly programId: d.ProgramId;
  readonly appState: AppState;
  readonly createdProgramMap: ReadonlyMap<d.ProgramId, ProgramWithClassList>;
}): React.ReactElement => {
  const program = props.createdProgramMap.get(props.programId);
  if (program === undefined) {
    return (
      <Link
        appState={props.appState}
        location={d.Location.Program(props.programId)}
      >
        プログラムの情報を読込中
      </Link>
    );
  }
  return (
    <Link
      appState={props.appState}
      location={d.Location.Program(props.programId)}
    >
      <Paper
        sx={{
          display: "grid",
          alignItems: "center",
          gridAutoFlow: "column",
          padding: "32px 16px",
        }}
      >
        <Typography>{program.name}</Typography>
      </Paper>
    </Link>
  );
};
