import * as React from "react";
import { withMuiTheme } from "@harelpls/storybook-addon-materialui";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
  layout: "fullscreen",
};

const fullScreen = (
  Story: () => React.ReactElement<unknown>
): React.ReactElement => {
  return (
    <div
      id="story-book-full-screen-decorator"
      style={{ display: "grid", placeItems: "center", height: "100vh" }}
    >
      <Story />
    </div>
  );
};

export const decorators = [withMuiTheme(), fullScreen];
