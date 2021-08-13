import * as React from "react";
import { AppState } from "../state";
import { GuestClassPage } from "./GuestClassPage";
import { JoinedClass } from "../state/loggedInState";
import { StudentClassPage } from "./StudentClassPage";

export type Props = {
  readonly appState: AppState;
  readonly joinedClass: JoinedClass;
};

/**
 * クラス参加者の詳細ページ
 */
export const ParticipantClassPage: React.VFC<Props> = (props) => {
  if (props.joinedClass.role === "Guest") {
    return (
      <GuestClassPage
        appState={props.appState}
        qClassForParticipant={props.joinedClass.class}
      />
    );
  }
  return (
    <StudentClassPage
      appState={props.appState}
      qClassForParticipant={props.joinedClass.class}
      participantList={props.joinedClass.participantList}
      questionTreeList={props.joinedClass.questionTreeList}
    />
  );
};
