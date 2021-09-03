import * as React from "react";
import * as d from "../../data";
import { AppState, LoggedInState } from "../state";
import { Avatar, Box, Breadcrumbs, Typography } from "@material-ui/core";
import {
  getClassNameAndStudent,
  getStudentConfirmedAnswer,
} from "../state/loggedInState";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { imageUrl } from "../../common/url";

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
  const question = props.appState.question(
    props.adminStudentAnswerPageParameter.questionId
  );
  const classNameAndStudent = getClassNameAndStudent(
    props.loggedInState,
    props.adminStudentAnswerPageParameter.classId,
    props.adminStudentAnswerPageParameter.studentAccountId
  );
  if (confirmedAnswer === undefined || classNameAndStudent === undefined) {
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
          <Box padding={1}>
            <Typography variant="h5">{question?.name}</Typography>
          </Box>
          <Box padding={1}>
            生徒の確定された回答を取得中かまだ確定していない
          </Box>
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
        <Box padding={1}>
          <Typography variant="h5">{question?.name}</Typography>
        </Box>
        <Box padding={1}>
          <Avatar
            alt={classNameAndStudent.studentName}
            src={imageUrl(classNameAndStudent.studentImageHashValue).toString()}
          />
          {classNameAndStudent.studentName}
        </Box>
        <Box padding={1}>{confirmedAnswer.answer}</Box>
      </Box>
    </PageContainer>
  );
};
