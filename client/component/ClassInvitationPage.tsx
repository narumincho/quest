import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Paper, makeStyles } from "@material-ui/core";
import { AppState } from "../state";
import { JoinedClass } from "../state/loggedInState";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { api } from "../api";

type ClassNameAndClassId = {
  readonly name: string;
  readonly classId: d.ClassId;
};

export const ClassInvitationPage = (props: {
  readonly appState: AppState;
  readonly studentClassInvitationToken: d.StudentClassInvitationToken;
}): React.ReactElement => {
  const [classNameAndClassId, setClassNameAndClassId] = React.useState<
    ClassNameAndClassId | undefined
  >(undefined);
  const [isRequestingJoin, setIsRequestingJoin] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    api
      .getClassByClassInvitationToken(props.studentClassInvitationToken)
      .then((response) => {
        if (response._ === "Ok") {
          setClassNameAndClassId({
            classId: response.okValue.id,
            name: response.okValue.name,
          });
        }
      });
  }, [props.studentClassInvitationToken]);

  const joinedClassData =
    props.appState.logInState.tag === "LoggedIn" &&
    classNameAndClassId !== undefined
      ? props.appState.logInState.loggedInState.joinedClassMap.get(
          classNameAndClassId.classId
        )
      : undefined;

  const requestJoin = (): void => {
    props.appState.joinClass(props.studentClassInvitationToken);
    setIsRequestingJoin(true);
  };

  return (
    <PageContainer isHideBack appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <div></div>
          </Breadcrumbs>
        </Box>
        <MessageOrButton
          classNameAndClassId={classNameAndClassId}
          joinedClassData={joinedClassData}
          isRequestingJoin={isRequestingJoin}
          requestJoin={requestJoin}
          appState={props.appState}
        />
      </Box>
    </PageContainer>
  );
};

const useStyles = makeStyles({
  card: {
    display: "grid",
    alignItems: "center",
    gridAutoFlow: "column",
    padding: 16,
  },
});

const MessageOrButton = (props: {
  readonly classNameAndClassId: ClassNameAndClassId | undefined;
  readonly joinedClassData: JoinedClass | undefined;
  readonly isRequestingJoin: boolean;
  readonly requestJoin: () => void;
  readonly appState: AppState;
}): React.ReactElement => {
  const classes = useStyles();

  if (props.classNameAndClassId === undefined) {
    return <Box> 確認中……</Box>;
  }
  if (props.joinedClassData !== undefined) {
    return (
      <Box>
        <Box>すでに{props.joinedClassData.class.name}に参加しています.</Box>
        <Box padding={1}>
          <Link
            location={d.Location.Class(props.joinedClassData.class.id)}
            appState={props.appState}
          >
            <Paper className={classes.card}>
              {props.joinedClassData.class.name} のページ
            </Paper>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      disabled={props.isRequestingJoin}
      onClick={props.requestJoin}
    >
      {props.isRequestingJoin
        ? props.classNameAndClassId.name + "に参加中……"
        : props.classNameAndClassId.name + "に参加する"}
    </Button>
  );
};
