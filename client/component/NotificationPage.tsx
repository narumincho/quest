import * as React from "react";
import * as d from "../../data";
import { Box, Breadcrumbs, Paper, Typography } from "@mui/material";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";

export const NotificationPage = (props: {
  readonly appState: AppState;
}): React.ReactElement => {
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Breadcrumbs>
          <Link appState={props.appState} location={d.Location.Top}>
            トップページ
          </Link>
          <div></div>
        </Breadcrumbs>
      </Box>
      <Box padding={1}>
        <Typography variant="h5">通知</Typography>
      </Box>
      <Box display="grid" padding={1} gap={1}>
        {[
          { text: "サンプル通知A トップページ行き", link: d.Location.Top },
          { text: "サンプル通知B 設定ページ行き", link: d.Location.Setting },
        ].map((item) => (
          <NotificationItem
            key={item.text}
            text={item.text}
            link={item.link}
            appState={props.appState}
          />
        ))}
      </Box>
    </PageContainer>
  );
};

const NotificationItem = (props: {
  readonly text: string;
  readonly link: d.Location;
  readonly appState: AppState;
}): React.ReactElement => {
  return (
    <Link appState={props.appState} location={props.link}>
      <Paper
        sx={{
          padding: 1,
        }}
      >
        <Typography>{props.text}</Typography>
      </Paper>
    </Link>
  );
};
