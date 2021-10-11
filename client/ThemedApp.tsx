import * as React from "react";
import {
  CssBaseline,
  PaletteMode,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { App } from "./App";
import { SnackbarProvider } from "notistack";

export const ThemedApp = (): React.ReactElement => {
  const [paletteMode, setPaletteMode] = React.useState<PaletteMode>(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  React.useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (e.matches) {
          setPaletteMode("dark");
        } else {
          setPaletteMode("light");
        }
      });
  }, []);

  const theme = createTheme({
    palette: {
      mode: paletteMode,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};
