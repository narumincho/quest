import * as React from "react";
import { Box, CircularProgress } from "@mui/material";

export const LoadingPage = (): React.ReactElement => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "grid",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
