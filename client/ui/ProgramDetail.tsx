import * as React from "react";
import * as d from "../../data";

export type Props = {
  name: string;
  createAccountId: d.AccountId;
};

export const ProgramDetail: React.VFC<Props> = (props) => {
  return (
    <div>
      プログラム詳細ページ
      <div>プログラム名: {props.name}</div>
    </div>
  );
};
