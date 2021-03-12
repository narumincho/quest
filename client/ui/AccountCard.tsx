import * as React from "react";
import * as d from "../../data";
import { AppState } from "../state";

export type Props = {
  readonly accountId: d.AccountId;
  readonly appState: AppState;
};

export const AccountCard: React.VFC<Props> = (props) => {
  const account = props.appState.account(props.accountId);
  if (account === undefined) {
    return <div>アカウントの情報を読込中</div>;
  }
  return <div>{account.name}</div>;
};
