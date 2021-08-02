import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";

/**
 * 生徒から見たクラスの詳細ページ. ゲストとは違う
 * @returns
 */
export const StudentClassPage = (props: {
  readonly appState: AppState;
  readonly qClassForParticipant: d.QClassStudentOrGuest;
}): React.ReactElement => {
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">{props.qClassForParticipant.name}</Typography>
      </Box>
      <Box padding={1}>生徒から見たクラスの詳細ページ</Box>
      <Box padding={1}>クラスID: {props.qClassForParticipant.id}</Box>
    </PageContainer>
  );
};
