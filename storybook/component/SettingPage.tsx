import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";
import { SettingPage } from "../../client/component/SettingPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "SettingPage",
  component: SettingPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <SettingPage account={mockAccount} appState={mockAppState} />
);
