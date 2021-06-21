import * as React from "react";
import * as d from "../../data";

export type Props = {
  readonly classId: d.QClassId;
};

export const ParticipantClassPage: React.VFC<Props> = (props) => {
  return (
    <div>
      参加者向けのクラスページ!
      <div>classId: {props.classId}</div>
    </div>
  );
};
