import * as React from "react";
import { AppBar, LeftActionType } from "./AppBar";
import { AppState } from "../state";
import { Box } from "@mui/material";

/**
 * `AppBar` を内包した, ページのコンテナーコンポーネント
 * @param props
 * @returns
 */
export const PageContainer = (props: {
  /**
   * アプリの状態
   */
  readonly appState: AppState;
  /**
   * AppBar 内の 左に置くボタン
   */
  readonly leftActionType: LeftActionType;
  /**
   * ダークモードかどうか
   */
  readonly isDarkMode: boolean;
  /**
   * 子要素
   */
  readonly children: React.ReactNode;
}): React.ReactElement => {
  return (
    <Box width="100%" height="100%" display="grid" gridTemplateRows="auto 1fr">
      <AppBar
        leftActionType={props.leftActionType}
        appState={props.appState}
        isDarkMode={props.isDarkMode}
      />
      <Box
        sx={{
          backgroundColor: props.isDarkMode ? "#222" : "#eee",
          color: props.isDarkMode ? "#eee" : "#000",
          minHeight: "100%",
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
