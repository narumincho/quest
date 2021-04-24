import * as React from "react";
import { Box, CircularProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  loadingIcon: {
    width: "100%",
    height: "100vh",
    display: "grid",
    justifyContent: "center",
    alignContent: "center",
  },
});

export const LoadingPage: React.VFC<Record<never, never>> = () => {
  const classes = useStyles();
  return (
    <Box className={classes.loadingIcon}>
      <CircularProgress />
    </Box>
  );
};
