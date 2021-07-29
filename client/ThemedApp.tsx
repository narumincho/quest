import * as React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@material-ui/core";
import { App } from "./App";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { SnackbarProvider } from "notistack";

type DarkOrLight = PaletteOptions["type"];

export const ThemedApp: React.FC<Record<never, never>> = () => {
  const [darkOrLight, setDarkOrLight] = React.useState<DarkOrLight>(
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
      type: darkOrLight,
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
