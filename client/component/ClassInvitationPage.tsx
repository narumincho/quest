import * as React from "react";
import * as d from "../../data";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";

export const ClassInvitationPage: React.VFC<{
  appState: AppState;
  classInvitationToken: d.QClassInvitationToken;
}> = (props) => {
  return (
    <PageContainer isHideBack appState={props.appState}>
      招待URLを開いたようだね
    </PageContainer>
  );
};
