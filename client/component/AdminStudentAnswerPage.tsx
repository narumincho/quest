import * as React from "react";
import * as d from "../../data";
import { AppState, LoggedInState } from "../state";
import { Box, Breadcrumbs } from "@material-ui/core";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { getStudentConfirmedAnswer } from "../state/loggedInState";

export const AdminStudentAnswerPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly adminStudentAnswerPageParameter: d.AdminStudentAnswerPageParameter;
}): React.ReactElement => {
  const confirmedAnswer = getStudentConfirmedAnswer(
    props.loggedInState,
    props.adminStudentAnswerPageParameter.classId,
    props.adminStudentAnswerPageParameter.studentAccountId,
    props.adminStudentAnswerPageParameter.questionId
  );
  if (confirmedAnswer === undefined) {
    return (
      <PageContainer appState={props.appState}>
        <Box padding={1}>
          <Box padding={1}>
            <Breadcrumbs>
              <Link appState={props.appState} location={d.Location.Top}>
                トップページ
              </Link>
              <div></div>
            </Breadcrumbs>
          </Box>
          <Box padding={1}>生徒の確定された回答を取得中</Box>
        </Box>
      </PageContainer>
    );
  }
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>{confirmedAnswer.answer}</Box>
      </Box>
    </PageContainer>
  );
};
