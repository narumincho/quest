import * as React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { App } from "./App";
import { SnackbarProvider } from "notistack";

export const ThemedApp = (): React.ReactElement => {
  const [darkOrLight, setDarkOrLight] = React.useState<"dark" | "light">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  React.useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (e.matches) {
          setDarkOrLight("dark");
        } else {
          setDarkOrLight("light");
        }
      });
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkOrLight,
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
