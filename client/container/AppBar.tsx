import * as React from "react";
import * as d from "../../data";
import { AppBar as PureAppBar } from "../ui/AppBar";

export type Props = {
  title: string;
  /**
   * 右に表示するアカウント. 指定なしで非表示
   */
  account?: d.QAccount;
  /**
   * 戻るボタンを隠すか
   * @default false
   */
  isHideBack?: boolean;
};

const historyBack = () => {
  window.history.back();
};

export const AppBar: React.VFC<Props> = (props) => {
  return (
    <PureAppBar
      title={props.title}
      account={props.account}
      isHideBack={props.isHideBack}
      onBackClick={historyBack}
    />
  );
};
