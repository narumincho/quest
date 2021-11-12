import * as React from "react";
import * as d from "../../data";
import { Avatar, Box, Breadcrumbs, Typography } from "@mui/material";
import {
  LoggedInState,
  QuestionTree,
  QuestionTreeListWithLoadingState,
  getClassNameAndStudent,
  getCreatedProgramIdByClassId,
  getQuestionTreeListWithLoadingStateInProgram,
  getStudentConfirmedAnswer,
} from "../state/loggedInState";
import { AppState } from "../state";
import { ChevronRight } from "@mui/icons-material";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { imageUrl } from "../../common/url";

export const AdminStudentPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
  readonly accountId: d.AccountId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  React.useEffect(() => {
    props.appState.requestStudentConfirmedAnswerList({
      accountToken: props.loggedInState.accountToken,
      classId: props.classId,
      studentAccountId: props.accountId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.accountId, props.classId, props.loggedInState.accountToken]);

  const program = getCreatedProgramIdByClassId(
    props.loggedInState,
    props.classId
  );
  const classNameAndStudent = getClassNameAndStudent(
    props.loggedInState,
    props.classId,
    props.accountId
  );
  if (program === undefined || classNameAndStudent === undefined) {
    return (
      <PageContainer
        appState={props.appState}
        isDarkMode={props.isDarkMode}
        leftActionType="back"
      >
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
            クラスの質問情報か生徒の情報を取得できませんでした
          </Box>
        </Box>
      </PageContainer>
    );
  }
  return (
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <Link
              appState={props.appState}
              location={d.Location.Program(program.id)}
            >
              {program.name}
            </Link>
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">
            <Avatar
              alt={classNameAndStudent.studentName}
              src={imageUrl(
                classNameAndStudent.studentImageHashValue
              ).toString()}
            />
            {classNameAndStudent.studentName}
          </Typography>
        </Box>
        <Box padding={1}>
          <Typography>確定された質問:</Typography>
          <QuestionTreeListWithLoading
            questionTreeListWithLoadingState={getQuestionTreeListWithLoadingStateInProgram(
              props.loggedInState,
              program.id
            )}
            loggedInState={props.loggedInState}
            appState={props.appState}
            classId={props.classId}
            studentAccountId={props.accountId}
          />
        </Box>
        <Box padding={1}>
          <Typography>アカウントID: {props.accountId}</Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};

export const QuestionTreeListWithLoading = (props: {
  readonly questionTreeListWithLoadingState: QuestionTreeListWithLoadingState;
  readonly loggedInState: LoggedInState;
  readonly appState: AppState;
  readonly classId: d.ClassId;
  readonly studentAccountId: d.AccountId;
}): React.ReactElement => {
  if (props.questionTreeListWithLoadingState.tag === "Empty") {
    return (
      <Box padding={1}>
        <Typography>リクエスト待ち</Typography>
      </Box>
    );
  }
  if (props.questionTreeListWithLoadingState.tag === "Requesting") {
    return (
      <Box padding={1}>
        <Typography>読込中</Typography>
      </Box>
    );
  }
  if (props.questionTreeListWithLoadingState.tag === "Error") {
    return (
      <Box padding={1}>
        <Typography>取得に失敗しました</Typography>
      </Box>
    );
  }
  const treeList = props.questionTreeListWithLoadingState.questionTreeList;
  if (treeList.length === 0) {
    return (
      <Box padding={1}>
        <Typography>質問が1つもありません</Typography>
      </Box>
    );
  }

  return (
    <QuestionTreeList
      questionTreeList={treeList}
      loggedInState={props.loggedInState}
      appState={props.appState}
      classId={props.classId}
      studentAccountId={props.studentAccountId}
    />
  );
};

const QuestionTreeList = (props: {
  readonly questionTreeList: ReadonlyArray<QuestionTree>;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
  readonly studentAccountId: d.AccountId;
}): React.ReactElement => {
  return (
    <Box>
      {props.questionTreeList.map((questionTree, index) => (
        <QuestionTreeLoaded
          key={index}
          questionTree={questionTree}
          loggedInState={props.loggedInState}
          appState={props.appState}
          classId={props.classId}
          studentAccountId={props.studentAccountId}
        />
      ))}
    </Box>
  );
};

export const QuestionTreeLoaded = (props: {
  readonly questionTree: QuestionTree;
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
  readonly studentAccountId: d.AccountId;
}): React.ReactElement => {
  const confirmedAnswer = getStudentConfirmedAnswer(
    props.loggedInState,
    props.classId,
    props.studentAccountId,
    props.questionTree.id
  );
  return (
    <Box
      sx={{
        borderLeft: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    >
      {confirmedAnswer === undefined ? (
        <Box sx={{ display: "flex" }}>
          <ChevronRight />
          <Typography>{props.questionTree.text}</Typography>
        </Box>
      ) : (
        <Link
          appState={props.appState}
          location={d.Location.StudentAnswer({
            questionId: props.questionTree.id,
            answerStudentId: props.studentAccountId,
            classId: props.classId,
          })}
        >
          <Box sx={{ display: "flex" }}>
            <ChevronRight />
            <Typography>{props.questionTree.text}</Typography>
          </Box>
        </Link>
      )}

      <Box padding={1}>
        {props.questionTree.children.map((child) => (
          <QuestionTreeLoaded
            questionTree={child}
            appState={props.appState}
            loggedInState={props.loggedInState}
            key={child.id}
            classId={props.classId}
            studentAccountId={props.studentAccountId}
          />
        ))}
      </Box>
    </Box>
  );
};
