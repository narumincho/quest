import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Button, Typography } from "@material-ui/core";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";

export type Props = {
  readonly a: AppState;
  readonly classId: d.QClassId;
};

export const ClassPage: React.VFC<Props> = (props) => {
  const qClass = props.a.getClass(props.classId);
  if (qClass === undefined) {
    return (
      <PageContainer appState={props.a}>
        <Box>クラス読み込み準備中</Box>
        <Box padding={1}>
          <Box padding={1}>
            <Breadcrumbs>
              <Link appState={props.a} location={d.QLocation.Top}>
                作成したプログラム
              </Link>
              <div></div>
            </Breadcrumbs>
          </Box>
        </Box>
        <Box padding={1}>
          <Typography>クラスID: {props.classId}</Typography>
        </Box>
      </PageContainer>
    );
  }
  const program = props.a.program(qClass.programId);
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
              location={d.QLocation.Program(qClass.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>

            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">{qClass.name}</Typography>
        </Box>
        <Box padding={1}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => {
              props.a.shareClassInviteLink(props.classId);
            }}
          >
            招待URLをシェアする
          </Button>
        </Box>
        <Box padding={1}>
          <Typography>クラスID: {props.classId}</Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};