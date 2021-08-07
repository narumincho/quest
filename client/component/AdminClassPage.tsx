import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { ClassWithParticipantList } from "../state/loggedInState";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { ParticipantList } from "./ParticipantList";

export type Props = {
  readonly a: AppState;
  readonly classWithParticipantList: ClassWithParticipantList;
};

/**
 * クラス作成者向けのクラス詳細ページ
 */
export const AdminClassPage: React.VFC<Props> = (props) => {
  React.useEffect(
    () => {
      props.a.requestGetQuestionListInProgram(
        props.classWithParticipantList.qClass.programId
      );
      props.a.requestParticipantListInClass(
        props.classWithParticipantList.qClass.id
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.classWithParticipantList.qClass.id]
  );

  const program = props.a.program(
    props.classWithParticipantList.qClass.programId
  );
  return (
    <PageContainer appState={props.a}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.a} location={d.QLocation.Top}>
              トップページ
            </Link>
            <Link
              appState={props.a}
              location={d.QLocation.Program(
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
            participantList={props.classWithParticipantList.participantList}
          />
        </Box>
        <Box padding={1}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => {
              props.a.shareClassInviteLink(
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
