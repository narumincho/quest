import * as React from "react";
import * as d from "../../data";
import { Box, Typography } from "@mui/material";
import { AccountIcon } from "./AccountIcon";
import { AppState } from "../state";
import { Link } from "./Link";

/**
 * クラスの参加者一覧表示
 */
export const ParticipantList = (props: {
  readonly appState: AppState;
  readonly linkFunc?: ((accountId: d.AccountId) => d.Location) | undefined;
  readonly participantList: ReadonlyArray<d.Participant> | undefined;
}): React.ReactElement => {
  if (props.participantList === undefined) {
    return <Typography>取得中</Typography>;
  }
  if (props.participantList.length === 0) {
    return <Typography>まだ誰も参加していません</Typography>;
  }
  const linkFunc = props.linkFunc;
  if (linkFunc === undefined) {
    return (
      <Box>
        {props.participantList.map((participant) => (
          <ParticipantItem
            key={participant.account.id}
            participant={participant}
          />
        ))}
      </Box>
    );
  }
  return (
    <Box>
      {props.participantList.map((participant) => (
        <Link
          key={participant.account.id}
          location={linkFunc(participant.account.id)}
          appState={props.appState}
        >
          <ParticipantItem participant={participant} />
        </Link>
      ))}
    </Box>
  );
};

const ParticipantItem = (props: {
  readonly participant: d.Participant;
}): React.ReactElement => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: 1,
        gap: 1,
      }}
    >
      <AccountIcon
        name={props.participant.account.name}
        imageHashValue={props.participant.account.iconHash}
      />
      {props.participant.account.name}

      {props.participant.role === d.ClassParticipantRole.Student
        ? "(生徒)"
        : "(ゲスト)"}
    </Box>
  );
};
