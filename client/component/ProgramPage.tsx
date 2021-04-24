import * as React from "react";
import * as d from "../../data";
import { AccountCard, AppBar, ClassCard, QuestionTreeList } from "../ui";
import {
  AppState,
  RequestClassListInProgramState,
  RequestQuestionListInProgramState,
} from "../state";
import {
  Box,
  Breadcrumbs,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Link } from "../ui/Link";

export type Props = {
  readonly programId: d.QProgramId;
  readonly appState: AppState;
};

export const ProgramPage: React.VFC<Props> = (props) => {
  const program = props.appState.program(props.programId);

  React.useEffect(() => {
    props.appState.requestGetQuestionListInProgram(props.programId);
    props.appState.requestGetClassListInProgram(props.programId);
  }, []);

  if (program === undefined) {
    return (
      <Box>
        <AppBar appState={props.appState} />
        <Box padding={1}>
          <Box padding={1}>
            <Breadcrumbs>
              <Link appState={props.appState} location={d.QLocation.Top}>
                作成したプログラム
              </Link>
              <div></div>
            </Breadcrumbs>
          </Box>
        </Box>
        <Box>プログラム読み込み準備中</Box>
        <Box padding={1}>
          <Typography>プログラムID: {props.programId}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar appState={props.appState} />
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.QLocation.Top}>
              作成したプログラム
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
            appState={props.appState}
            accountId={program.createAccountId}
          />
        </Box>
        <Box padding={1}>
          <Typography>質問:</Typography>
          <QuestionList
            questionList={program.questionIdList}
            appState={props.appState}
            programId={props.programId}
          />
          <Box padding={1}>
            <Link
              appState={props.appState}
              location={d.QLocation.NewQuestion({
                parent: d.Maybe.Nothing(),
                programId: props.programId,
                text: "",
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
            requestCLassListInProgramState={program.classIdList}
            a={props.appState}
            programId={props.programId}
          />
          <Box padding={1}>
            <Link
              appState={props.appState}
              location={d.QLocation.NewClass(props.programId)}
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
    </Box>
  );
};

export const QuestionList: React.VFC<{
  questionList: RequestQuestionListInProgramState;
  appState: AppState;
  programId: d.QProgramId;
}> = (props) => {
  if (props.questionList.tag === "None") {
    return (
      <Box padding={1}>
        <Typography>リクエスト待ち</Typography>
      </Box>
    );
  }
  if (props.questionList.tag === "Requesting") {
    return (
      <Box padding={1}>
        <Typography>読込中</Typography>
      </Box>
    );
  }
  const list = props.questionList.questionIdList;
  if (list.length === 0) {
    return (
      <Box padding={1}>
        <Typography>質問が1つもありません</Typography>
      </Box>
    );
  }
  const treeList = props.appState.questionTree(props.programId);

  return (
    <QuestionTreeList questionTreeList={treeList} appState={props.appState} />
  );
};

const useStyle = makeStyles({
  list: {
    padding: 8,
    display: "grid",
    gap: 8,
  },
});

const ClassList: React.VFC<{
  requestCLassListInProgramState: RequestClassListInProgramState;
  a: AppState;
  programId: d.QProgramId;
}> = (props) => {
  const classes = useStyle();
  if (props.requestCLassListInProgramState.tag === "None") {
    return (
      <Box padding={1}>
        <Typography>リクエスト待ち</Typography>
      </Box>
    );
  }
  if (props.requestCLassListInProgramState.tag === "Requesting") {
    return (
      <Box padding={1}>
        <Typography>読込中</Typography>
      </Box>
    );
  }
  const list = props.requestCLassListInProgramState.classIdList;
  if (list.length === 0) {
    return (
      <Box padding={1}>
        <Typography>クラスが1つもありません</Typography>
      </Box>
    );
  }
  return (
    <Box className={classes.list}>
      {list.map((classId) => (
        <ClassCard a={props.a} classId={classId} key={classId} />
      ))}
    </Box>
  );
};
