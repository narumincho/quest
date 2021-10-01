import * as React from "react";
import { AppState } from "../state";
import { GuestClassPage } from "./GuestClassPage";
import { JoinedClass } from "../state/loggedInState";
import { StudentClassPage } from "./StudentClassPage";

/**
 * クラス参加者の詳細ページ
 */
export const ParticipantClassPage = (props: {
  readonly appState: AppState;
  readonly joinedClass: JoinedClass;
}): React.ReactElement => {
  if (props.joinedClass.class.role === "Guest") {
    return (
      <GuestClassPage
        appState={props.appState}
        participantClass={props.joinedClass.class}
      />
    );
  }
  return (
    <StudentClassPage
      appState={props.appState}
      participantClass={props.joinedClass.class}
      participantList={props.joinedClass.participantList}
      questionTreeList={props.joinedClass.questionTreeList}
    />
  );
};
