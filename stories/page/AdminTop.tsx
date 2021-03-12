import * as React from "react";
import { AdminTop, Props } from "../../client/page/AdminTop";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/AdminTop",
  component: AdminTop,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<Props> = () => (
  <AdminTop account={mockAccount} appState={mockAppState} />
);
