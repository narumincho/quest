import * as React from "react";
import * as d from "../../data";
import { Avatar, Box, Typography, makeStyles } from "@material-ui/core";
import { imageUrl } from "../../common/url";

const useParticipantListStyles = makeStyles({
  item: {
    display: "flex",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
});

/**
 * クラスの参加者一覧表示
 */
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
