import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "../ui";
import { AppState } from "../state";

export type Props = {
  readonly programId: d.QProgramId;
  readonly account: d.QAccount;
  readonly appState: AppState;
};

export const Program: React.VFC<Props> = (props) => {
  const program = props.appState.program(props.programId);
  if (program === undefined) {
    return (
      <Box>
        <AppBar
          title="プログラム読み込み中"
          account={props.account}
          appState={props.appState}
        />
        <Box></Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar
        title={`${program.name} | プログラム`}
        account={props.account}
        appState={props.appState}
      />
      <Box></Box>
      <Typography>{program.name}</Typography>
    </Box>
  );
};
