import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Typography,
} from "@material-ui/core";
import { AppBar } from "./AppBar";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";

export type Props = { account: d.QAccount; appState: AppState };

export const SettingPage: React.VFC<Props> = (props) => {
  return (
    <PageContainer appState={props.appState}>
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
          <Typography variant="h5">設定</Typography>
        </Box>

        <Box padding={1}>アカウントID: {props.account.id}</Box>
        <Box padding={1}>
          アカウント画像:
          <Avatar
            alt={props.account.name}
            src={commonUrl.imageUrl(props.account.iconHash).toString()}
          />
        </Box>
        <Box padding={1}>
          アカウント名:
          {props.account.name}
        </Box>
        <Box padding={1}>
          <Button fullWidth variant="contained" onClick={props.appState.logout}>
            ログアウトする
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};