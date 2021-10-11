import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { Avatar, Box, Paper, Typography } from "@mui/material";
import { AppState } from "../state";
import { LoggedInState } from "../state/loggedInState";

export const AccountCard = (props: {
  readonly accountId: d.AccountId;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const account = props.loggedInState.accountMap.get(props.accountId);
  if (account === undefined) {
    return <Box>アカウントの情報を読込中</Box>;
  }
  return (
    <Paper
      sx={{
        display: "grid",
        alignItems: "center",
        gridAutoFlow: "column",
        padding: 1,
      }}
    >
      <Avatar
        alt={account.name}
        src={commonUrl.imageUrl(account.iconHash).toString()}
      />
      <Typography>{account.name}</Typography>
    </Paper>
  );
};
