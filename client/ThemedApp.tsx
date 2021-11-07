import * as React from "react";
import {
  CssBaseline,
  PaletteMode,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { App } from "./App";
import { SnackbarProvider } from "notistack";

export const ThemedApp = (): React.ReactElement => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <App isDarkMode={isDarkMode} />
      </SnackbarProvider>
    </ThemeProvider>
  );
};
