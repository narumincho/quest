import * as React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useDarkMode } from "storybook-dark-mode";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
  layout: "fullscreen",
};

const FullScreen = (
  Story: () => React.ReactElement<unknown>
): React.ReactElement => {
  const mode = useDarkMode() ? "dark" : "light";

  const theme = createTheme({
    palette: {
      mode,
    },
  });
  console.log("theme", theme);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        id="story-book-full-screen-decorator"
        style={{ display: "grid", placeItems: "center", height: "100vh" }}
      >
        <Story />
      </div>
    </ThemeProvider>
  );
};

export const decorators = [FullScreen];
