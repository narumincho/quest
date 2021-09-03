import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Typography } from "@material-ui/core";
import {
  ClassWithParticipantList,
  LoggedInState,
} from "../state/loggedInState";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ParticipantList } from "./ParticipantList";

/**
 * クラス作成者向けのクラス詳細ページ
 */
export const AdminClassPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classWithParticipantList: ClassWithParticipantList;
}): React.ReactElement => {
  React.useEffect(
    () => {
      props.appState.requestGetQuestionListInProgram(
        props.classWithParticipantList.qClass.programId
      );
      props.appState.requestParticipantListInClass(
        props.classWithParticipantList.qClass.id
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.classWithParticipantList.qClass.id]
  );

  const program = props.loggedInState.createdProgramMap.get(
    props.classWithParticipantList.qClass.programId
  );
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <Link
              appState={props.appState}
              location={d.Location.Program(
                props.classWithParticipantList.qClass.programId
              )}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>

            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h4">
            {props.classWithParticipantList.qClass.name}
          </Typography>
        </Box>
        <Box padding={1}>
          <Typography variant="h6">クラスの参加者</Typography>
          <ParticipantList
            appState={props.appState}
            linkFunc={(accountId) =>
              d.Location.AdminStudent({
                accountId,
                classId: props.classWithParticipantList.qClass.id,
              })
            }
            participantList={props.classWithParticipantList.participantList?.map(
              (p): d.Participant => ({
                account: p.account,
                role:
                  p.role === "student"
                    ? d.ClassParticipantRole.Student
                    : d.ClassParticipantRole.Guest,
              })
            )}
          />
        </Box>
        <Box padding={1}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => {
              props.appState.shareClassInviteLink(
                props.classWithParticipantList.qClass.id
              );
            }}
          >
            招待URLをシェアする
          </Button>
        </Box>
        <Box padding={1}>
          <Typography>
            クラスID: {props.classWithParticipantList.qClass.id}
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};
