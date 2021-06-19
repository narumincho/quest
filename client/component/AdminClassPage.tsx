import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Typography } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";

export type Props = {
  readonly a: AppState;
  readonly qClass: d.QClass;
};

/**
 * クラス作成者向けのクラス詳細ページ
 */
export const AdminClassPage: React.VFC<Props> = (props) => {
  React.useEffect(
    () => {
      props.a.requestGetQuestionListInProgram(props.qClass.programId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.qClass.id]
  );

  const program = props.a.program(props.qClass.programId);
  return (
    <PageContainer appState={props.a}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.a} location={d.QLocation.Top}>
              作成したプログラム
            </Link>
            <Link
              appState={props.a}
              location={d.QLocation.Program(props.qClass.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>

            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">{props.qClass.name}</Typography>
        </Box>
        <Box padding={1}>
          <Typography>クラスの参加者</Typography>
          <Typography>準備中……</Typography>
        </Box>
        <Box padding={1}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => {
              props.a.shareClassInviteLink(props.qClass.id);
            }}
          >
            招待URLをシェアする
          </Button>
        </Box>
        <Box padding={1}>
          <Typography>クラスID: {props.qClass.id}</Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};
