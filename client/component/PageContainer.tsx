import * as React from "react";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Box } from "@material-ui/core";

/**
 * `AppBar` を内包した, ページのコンテナーコンポーネント
 * @param props
 * @returns
 */
export const PageContainer: React.FC<{
  /**
   * アプリの状態
   */
  readonly appState: AppState;
  /**
   * 戻るボタンを隠すか
   * @default false
   */
  readonly isHideBack?: boolean;
}> = (props) => {
  return (
    <Box width="100%" height="100%">
      <AppBar
        isHideBack={props.isHideBack ?? false}
        appState={props.appState}
      />
      {props.children}
    </Box>
  );
};
