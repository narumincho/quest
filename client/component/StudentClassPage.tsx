import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";
import { ParticipantList } from "./ParticipantList";
import { StudentSelfQuestionTreeList } from "./StudentSelfQuestionTreeList";

/**
 * 生徒から見たクラスの詳細ページ. ゲストとは違う
 * @returns
 */
export const StudentClassPage = (props: {
  readonly appState: AppState;
  readonly participantClass: d.ParticipantClass;
  readonly participantList: ReadonlyArray<d.Participant> | undefined;
  readonly questionTreeList:
    | ReadonlyArray<d.StudentSelfQuestionTree>
    | undefined;
  readonly loggedInState: LoggedInState;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  React.useEffect(
    () => {
      props.appState.requestParticipantListInClass(props.participantClass.id);
      props.appState.requestStudentQuestionTreeInClass(
        props.participantClass.id
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.participantClass.id]
  );
  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
      <Box padding={1}>
        <Breadcrumbs>
          <Link appState={props.appState} location={d.Location.Top}>
            トップページ
          </Link>

          <div></div>
        </Breadcrumbs>
      </Box>
      <Box padding={1}>
        <Typography variant="h5">{props.participantClass.name}</Typography>
      </Box>
      <Box padding={1}>
        <Typography variant="h6">クラスの参加者</Typography>
        <ParticipantList
          appState={props.appState}
          participantList={props.participantList}
        />
      </Box>
      <Box padding={1}>
        <StudentSelfQuestionTreeList
          treeList={props.questionTreeList}
          classId={props.participantClass.id}
          appState={props.appState}
          loggedInState={props.loggedInState}
        />
      </Box>
      <Box padding={1}>クラスID: {props.participantClass.id}</Box>
    </PageContainer>
  );
};
