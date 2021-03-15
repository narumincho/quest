import * as React from "react";
import * as d from "../../data";
import { AccountCard, AppBar, QuestionCard } from "../ui";
import { AppState, RequestQuestionListInProgramState } from "../state";
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

export const Program: React.VFC<Props> = (props) => {
  const program = props.appState.program(props.programId);

  React.useEffect(() => {
    props.appState.requestGetQuestionListInProgram(props.programId);
  }, []);

  if (program === undefined) {
    return (
      <Box>
        <AppBar title="プログラム読み込み中" appState={props.appState} />
        <Box></Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar title={program.name} appState={props.appState} />
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.QLocation.Top}>
              作成したプログラム
            </Link>
            <Typography>{program.name}</Typography>
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
            questionList={program.questionList}
            appState={props.appState}
          />
        </Box>
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
        <Box padding={1}>
          <Typography>プログラムID: {props.programId}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const useQuestionListStyles = makeStyles({
  box: {
    display: "grid",
    gap: 8,
  },
});

export const QuestionList: React.VFC<{
  questionList: RequestQuestionListInProgramState;
  appState: AppState;
}> = (props) => {
  const classes = useQuestionListStyles();
  if (props.questionList.tag === "None") {
    return (
      <Box>
        <Typography>リクエスト待ち</Typography>
      </Box>
    );
  }
  if (props.questionList.tag === "Requesting") {
    return (
      <Box>
        <Typography>読込中</Typography>
      </Box>
    );
  }
  const list = props.questionList.questionIdList;
  if (list.length === 0) {
    return (
      <Box>
        <Typography>質問が1つもありません</Typography>
      </Box>
    );
  }
  return (
    <Box className={classes.box}>
      {list.map((questionId) => (
        <QuestionCard
          key={questionId}
          appState={props.appState}
          questionId={questionId}
        />
      ))}
    </Box>
  );
};
