import * as React from "react";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Box } from "@mui/material";

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
  /**
   * ダークモードかどうか
   */
  readonly isDarkMode: boolean;
}> = (props) => {
  return (
    <Box width="100%" height="100%">
      <AppBar
        isHideBack={props.isHideBack ?? false}
        appState={props.appState}
        isDarkMode={props.isDarkMode}
      />
      <Box
        sx={{
          backgroundColor: props.isDarkMode ? "#222" : "#eee",
          color: props.isDarkMode ? "#eee" : "#000",
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
