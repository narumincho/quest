import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs } from "@material-ui/core";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";

export const AdminStudentAnswerPage = (props: {
  readonly appState: AppState;
}): React.ReactElement => {
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
        <Box padding={1}>生徒の確定された回答詳細ページ</Box>
      </Box>
    </PageContainer>
  );
};
