import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppBar } from "../ui";
import { AppState } from "../state";

export const Question: React.VFC<{
  appState: AppState;
  questionId: d.QQuestionId;
}> = (props) => {
  return (
    <Box>
      <AppBar title="質問" appState={props.appState} />
      <Typography>質問の詳細ページ</Typography>
    </Box>
  );
};