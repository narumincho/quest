import * as React from "react";
import * as d from "../../data";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { AppState } from "../state";
import { ClassWithParticipantList } from "../state/loggedInState";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { imageUrl } from "../../common/url";

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

const useParticipantListStyles = makeStyles({
  item: {
    display: "flex",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
});

export const ParticipantList: React.VFC<{
  readonly participantList:
    | ReadonlyArray<d.Tuple2<d.QAccount, d.QRole>>
    | undefined;
}> = (props) => {
  const classes = useParticipantListStyles();
  if (props.participantList === undefined) {
    return <Typography>取得中</Typography>;
  }
  if (props.participantList.length === 0) {
    return <Typography>まだ誰も参加していません</Typography>;
  }
  return (
    <Box>
      {props.participantList.map((participant) => (
        <Box key={participant.first.id} className={classes.item}>
          <Avatar
            alt={participant.first.name}
            src={imageUrl(participant.first.iconHash).toString()}
          />
          {participant.first.name}

          {participant.second === d.QRole.Student ? "(生徒)" : "(ゲスト)"}
        </Box>
      ))}
    </Box>
  );
};
