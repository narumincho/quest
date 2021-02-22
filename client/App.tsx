import * as React from "react";
import { AppBar, Box, Toolbar, Typography } from "@material-ui/core";
import { Content } from "./Content";

export const App: React.FC<Record<never, never>> = () => {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">質問</Typography>
        </Toolbar>
      </AppBar>
      <Content />
    </Box>
  );
};
