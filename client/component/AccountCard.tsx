import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { Avatar, Box, Paper, Typography, makeStyles } from "@material-ui/core";
import { AppState } from "../state";

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 8,
  },
});

export const AccountCard = (props: {
  readonly accountId: d.AccountId;
  readonly appState: AppState;
}): React.ReactElement => {
  const classes = useStyles();
  const account = props.appState.account(props.accountId);
  if (account === undefined) {
    return <Box>アカウントの情報を読込中</Box>;
  }
  return (
    <Paper className={classes.card}>
      <Avatar
        alt={account.name}
        src={commonUrl.imageUrl(account.iconHash).toString()}
      />
      <Typography>{account.name}</Typography>
    </Paper>
  );
};
