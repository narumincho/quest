import * as React from "react";
import { CssBaseline, ThemeProvider, createMuiTheme } from "@material-ui/core";
import { App } from "./App";
import { AppStateContainer } from "./state";
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
  });

  const theme = createMuiTheme({
    palette: {
      type: darkOrLight,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AppStateContainer.Provider>
          <App />
        </AppStateContainer.Provider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
