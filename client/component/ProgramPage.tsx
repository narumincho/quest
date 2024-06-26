import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Typography } from "@mui/material";
import {
  LoggedInState,
  QuestionTreeListWithLoadingState,
  getQuestionTreeListWithLoadingStateInProgram,
} from "../state/loggedInState";
import { AccountCard } from "./AccountCard";
import { Add } from "@mui/icons-material";
import { AppState } from "../state";
import { ClassCard } from "./ClassCard";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { QuestionTreeList } from "./QuestionTree";

export const ProgramPage = (props: {
  readonly programId: d.ProgramId;
  readonly loggedInState: LoggedInState;
  readonly appState: AppState;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
  const program = props.loggedInState.createdProgramMap.get(props.programId);

  React.useEffect(() => {
    props.appState.requestGetQuestionListInProgram(props.programId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.programId]);

  if (program === undefined) {
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
        </Box>
        <Box>
          あなたが作成していないまたは,
          存在していないためプログラムを表示することができませんでした
        </Box>
        <Box padding={1}>
          <Typography>プログラムID: {props.programId}</Typography>
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
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">{program.name}</Typography>
        </Box>
        <Box padding={1}>
          <Typography>作成者:</Typography>
          <AccountCard
            accountId={program.createAccountId}
            loggedInState={props.loggedInState}
          />
        </Box>
        <Box padding={1}>
          <Typography>質問:</Typography>
          <QuestionList
            questionTreeListWithLoadingState={getQuestionTreeListWithLoadingStateInProgram(
              props.loggedInState,
              props.programId
            )}
            appState={props.appState}
            programId={props.programId}
          />
          <Box padding={1}>
            <Link
              appState={props.appState}
              location={d.Location.NewQuestion({
                parent: d.Option.None(),
                programId: props.programId,
              })}
            >
              <Button fullWidth startIcon={<Add />} variant="contained">
                質問を作成する
              </Button>
            </Link>
          </Box>
        </Box>
        <Box padding={1}>
          <Typography>クラス:</Typography>
          <ClassList
            classList={program.classList.map(
              (classWithParticipantList) => classWithParticipantList.qClass
            )}
            a={props.appState}
            programId={props.programId}
          />
          <Box padding={1}>
            <Link
              appState={props.appState}
              location={d.Location.NewClass(props.programId)}
            >
              <Button fullWidth startIcon={<Add />} variant="contained">
                クラスを作成する
              </Button>
            </Link>
          </Box>
        </Box>
        <Box padding={1}>
          <Typography>プログラムID: {props.programId}</Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};

export const QuestionList = (props: {
  readonly questionTreeListWithLoadingState: QuestionTreeListWithLoadingState;
  readonly appState: AppState;
  readonly programId: d.ProgramId;
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
      appState={props.appState}
      programId={props.programId}
    />
  );
};

const ClassList = (props: {
  readonly classList: ReadonlyArray<d.AdminClass>;
  readonly a: AppState;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  if (props.classList.length === 0) {
    return (
      <Box padding={1}>
        <Typography>クラスが1つもありません</Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        padding: 1,
        display: "grid",
        gap: 1,
      }}
    >
      {props.classList.map((qClass) => (
        <ClassCard appState={props.a} class={qClass} key={qClass.id} />
      ))}
    </Box>
  );
};
