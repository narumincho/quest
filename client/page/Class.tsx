import * as React from "react";
import * as d from "../../data";
import { AppBar, Link } from "../ui";
import { Box, Breadcrumbs, Typography } from "@material-ui/core";
import { AppState } from "../state";

export type Props = {
  readonly a: AppState;
  readonly classId: d.QClassId;
};

export const Class: React.VFC<Props> = (props) => {
  const qClass = props.a.getClass(props.classId);
  if (qClass === undefined) {
    return (
      <Box>
        <AppBar appState={props.a} />
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
      </Box>
    );
  }
  const program = props.a.program(qClass.programId);
  return (
    <Box>
      <AppBar appState={props.a} />
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
          <Typography>クラスID: {props.classId}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
