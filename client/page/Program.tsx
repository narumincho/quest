import * as React from "react";
import * as d from "../../data";
import { AccountCard, AppBar } from "../ui";
import { Box, Typography } from "@material-ui/core";
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
      <Box padding={1}>
        <Typography>{program.name}</Typography>
        <Box padding={1}>
          作成者:
          <AccountCard
            appState={props.appState}
            accountId={program.createAccountId}
          />
        </Box>
      </Box>
    </Box>
  );
};
