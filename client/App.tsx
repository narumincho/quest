import * as React from "react";
import * as url from "../common/url";
import { AppBar, Box, Toolbar, Typography } from "@material-ui/core";
import { Content } from "./Content";
import { LineLogInButton } from "./LineLoginButton";
import { api } from "./api";

export const App: React.FC<Record<never, never>> = () => {
  const [accountName, setAccountName] = React.useState("");

  React.useEffect(() => {
    const nowUrl = new URL(location.href);
    const urlData = url.pathAndHashToUrlData(nowUrl.pathname, nowUrl.hash);
    console.log("urlData", urlData);
    if (urlData.accountToken !== undefined) {
      api.getAccountByAccountToken(urlData.accountToken).then((response) => {
        if (response._ === "Just") {
          setAccountName(response.value);
        }
      });
    }
  }, []);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">質問</Typography>
        </Toolbar>
      </AppBar>
      <Content />
      <div>{accountName}</div>
      <LineLogInButton />
    </Box>
  );
};
