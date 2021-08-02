import * as React from "react";
import * as d from "../../data";
import { AppState } from "../state";
import { GuestClassPage } from "./GuestClassPage";
import { StudentClassPage } from "./StudentClassPage";

export type Props = {
  readonly appState: AppState;
  readonly role: d.QRole;
  readonly qClassForParticipant: d.QClassStudentOrGuest;
};

/**
 * クラス参加者の詳細ページ
 */
export const ParticipantClassPage: React.VFC<Props> = (props) => {
  if (props.role === "Guest") {
    return (
      <GuestClassPage
        appState={props.appState}
        qClassForParticipant={props.qClassForParticipant}
      />
    );
  }
  return (
    <StudentClassPage
      appState={props.appState}
      qClassForParticipant={props.qClassForParticipant}
    />
  );
};
