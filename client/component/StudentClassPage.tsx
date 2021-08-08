import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ParticipantList } from "./ParticipantList";

/**
 * 生徒から見たクラスの詳細ページ. ゲストとは違う
 * @returns
 */
export const StudentClassPage = (props: {
  readonly appState: AppState;
  readonly qClassForParticipant: d.QClassStudentOrGuest;
  readonly participantList:
    | ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
    | undefined;
}): React.ReactElement => {
  React.useEffect(
    () => {
      props.appState.requestParticipantListInClass(
        props.qClassForParticipant.id
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.qClassForParticipant.id]
  );
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Breadcrumbs>
          <Link appState={props.appState} location={d.QLocation.Top}>
            トップページ
          </Link>

          <div></div>
        </Breadcrumbs>
      </Box>
      <Box padding={1}>
        <Typography variant="h5">{props.qClassForParticipant.name}</Typography>
      </Box>
      <Box padding={1}>
        <Typography variant="h6">クラスの参加者</Typography>
        <ParticipantList participantList={props.participantList} />
      </Box>
      <Box padding={1}>クラスID: {props.qClassForParticipant.id}</Box>
    </PageContainer>
  );
};
