import * as React from "react";
import * as d from "../../data";
import { Box, Button } from "@material-ui/core";
import { AppState } from "../state";
import { PageContainer } from "./PageContainer";
import { api } from "../api";

export const ClassInvitationPage: React.VFC<{
  appState: AppState;
  studentClassInvitationToken: d.StudentClassInvitationToken;
}> = (props) => {
  const [className, setClassName] = React.useState<string | undefined>(
    undefined
  );
  const [isRequestingJoin, setIsRequestingJoin] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    api
      .getClassByClassInvitationToken(props.studentClassInvitationToken)
      .then((response) => {
        if (response._ === "Ok") {
          setClassName(response.okValue.name);
          return;
        }
        setClassName(response.errorValue);
      });
  }, [props.studentClassInvitationToken]);

  const requestJoin = (): void => {
    props.appState.joinClass(props.studentClassInvitationToken);
    setIsRequestingJoin(true);
  };

  return (
    <PageContainer isHideBack appState={props.appState}>
      <Box padding={1}>
        {className === undefined ? (
          "確認中……"
        ) : (
          <Button
            variant="contained"
            disabled={isRequestingJoin}
            onClick={requestJoin}
          >
            {isRequestingJoin
              ? className + "に参加中……"
              : className + "に参加する"}
          </Button>
        )}
      </Box>
    </PageContainer>
  );
};
