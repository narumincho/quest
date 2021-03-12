import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";
import { Setting } from "../../client/page/Setting";

const meta: Meta = {
  title: "Page/Setting",
  component: Setting,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <Setting account={mockAccount} appState={mockAppState} />
);
