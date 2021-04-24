import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { LogInPage } from "../../client/component/LogInPage";
import { fullScreen } from "../decorators";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/Login",
  component: LogInPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <LogInPage appState={mockAppState} />
);
