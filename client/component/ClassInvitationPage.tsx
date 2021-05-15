import * as React from "react";
import * as d from "../../data";
import { Box, Button } from "@material-ui/core";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";
import { api } from "../api";

export const ClassInvitationPage: React.VFC<{
  appState: AppState;
  classInvitationToken: d.QClassInvitationToken;
}> = (props) => {
  const [className, setClassName] = React.useState<string | undefined>(
    undefined
  );
  const [isRequestingJoin, setIsRequestingJoin] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    api
      .getClassByClassInvitationToken(props.classInvitationToken)
      .then((response) => {
        if (response._ === "Ok") {
          setClassName(response.ok.name);
          return;
        }
        setClassName(response.error);
      });
  }, [props.classInvitationToken]);

  return (
    <PageContainer isHideBack appState={props.appState}>
      <Box>招待URLを開いたようだね</Box>
      {className === undefined ? (
        <Box>確認中……</Box>
      ) : (
        <Button variant="contained" disabled={isRequestingJoin}>
          {isRequestingJoin ? className + "に参加中" : className + "に参加する"}
        </Button>
      )}
    </PageContainer>
  );
};
