import * as React from "react";
import * as d from "../../data";

export type Props = {
  readonly account: d.Account;
};

export const AccountCard: React.VFC<Props> = (props) => {
  return <div>アカウントの情報をカードの形で表示したい</div>;
};
