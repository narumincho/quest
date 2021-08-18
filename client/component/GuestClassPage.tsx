import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";

/**
 * ゲストから見たクラスの詳細ページ. ゲストとは違
 * @returns
 */
export const GuestClassPage = (props: {
  readonly appState: AppState;
  readonly participantClass: d.ParticipantClass;
}): React.ReactElement => {
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Typography variant="h5">{props.participantClass.name}</Typography>
      </Box>
      <Box padding={1}>ゲストから見たクラスの詳細ページ</Box>
      <Box padding={1}>クラスID: {props.participantClass.id}</Box>
    </PageContainer>
  );
};
