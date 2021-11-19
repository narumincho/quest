import * as React from "react";
import * as d from "../../data";
import { Box, Paper, Typography } from "@mui/material";
import { LoggedInState, getAccountById } from "../state/loggedInState";
import { AccountIcon } from "./AccountIcon";

export const AccountCard = (props: {
  readonly accountId: d.AccountId;
  readonly loggedInState: LoggedInState;
}): React.ReactElement => {
  const account = getAccountById(props.loggedInState, props.accountId);
  if (account === undefined) {
    return <Box>アカウントの情報を読込中</Box>;
  }
  return <AccountCardFromData account={account} />;
};

export const AccountCardFromData = (props: {
  readonly account: d.Account;
}): React.ReactElement => {
  return (
    <Paper
      sx={{
        display: "grid",
        alignItems: "center",
        gridAutoFlow: "column",
        padding: 1,
      }}
    >
      <AccountIcon
        name={props.account.name}
        imageHashValue={props.account.iconHash}
      />
      <Typography>{props.account.name}</Typography>
    </Paper>
  );
};
