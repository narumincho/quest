import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";
import { SettingPage } from "../../client/component/SettingPage";

const meta: Meta = {
  title: "SettingPage",
  component: SettingPage,
};
export default meta;

export const Default: Story<never> = () => (
  <SettingPage account={mockAccount} appState={mockAppState} />
);
