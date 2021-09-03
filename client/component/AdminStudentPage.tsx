import * as React from "react";
import * as d from "../../data";
import { AppState, LoggedInState, QuestionTree } from "../state";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Typography,
  makeStyles,
} from "@material-ui/core";
import {
  QuestionTreeListWithLoadingState,
  getClassNameAndStudentName,
  getCreatedProgramIdByClassId,
} from "../state/loggedInState";
import { ChevronRight } from "@material-ui/icons";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { imageUrl } from "../../common/url";

export const AdminStudentPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly classId: d.ClassId;
  readonly accountId: d.AccountId;
}): React.ReactElement => {
  const program = getCreatedProgramIdByClassId(
    props.loggedInState,
    props.classId
  );
  const classNameAndStudent = getClassNameAndStudentName(
    props.loggedInState,
    props.classId,
    props.accountId
  );
  if (program === undefined || classNameAndStudent === undefined) {
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
            クラスの質問情報か生徒の情報を取得できませんでした
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
            questionTreeListWithLoadingState={props.appState.getQuestionTreeListWithLoadingStateInProgram(
              program.id
            )}
            appState={props.appState}
            programId={program.id}
          />
        </Box>
        <Box padding={1}>
          <Typography>アカウントID: {props.accountId}</Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};

export const QuestionTreeListWithLoading: React.VFC<{
  questionTreeListWithLoadingState: QuestionTreeListWithLoadingState;
  appState: AppState;
  programId: d.ProgramId;
}> = (props) => {
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
      appState={props.appState}
      programId={props.programId}
    />
  );
};

const QuestionTreeList: React.VFC<{
  questionTreeList: ReadonlyArray<QuestionTree>;
  appState: AppState;
  programId: d.ProgramId;
}> = (props) => {
  return (
    <Box>
      {props.questionTreeList.map((questionTree, index) => (
        <QuestionTreeLoaded
          key={index}
          questionTree={questionTree}
          appState={props.appState}
          programId={props.programId}
        />
      ))}
    </Box>
  );
};

const useStyles = makeStyles((theme) => ({
  item: {
    borderLeft: `solid 1px ${theme.palette.divider}`,
  },
  label: {
    display: "flex",
  },
}));

export const QuestionTreeLoaded: React.VFC<{
  questionTree: QuestionTree;
  appState: AppState;
  programId: d.ProgramId;
}> = (props) => {
  const classes = useStyles();
  return (
    <Box className={classes.item}>
      <Link
        appState={props.appState}
        location={d.Location.AdminQuestion({
          questionId: props.questionTree.id,
          programId: props.programId,
        })}
      >
        <Box className={classes.label}>
          <ChevronRight />
          <Typography>{props.questionTree.text}</Typography>
        </Box>
      </Link>

      <Box padding={1}>
        {props.questionTree.children.map((child) => (
          <QuestionTreeLoaded
            questionTree={child}
            appState={props.appState}
            key={child.id}
            programId={props.programId}
          />
        ))}
      </Box>
    </Box>
  );
};
