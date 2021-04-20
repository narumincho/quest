import { withMuiTheme } from "@harelpls/storybook-addon-materialui";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
};
export const decorators = [withMuiTheme()];