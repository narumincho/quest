import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";
import { NewQuestion } from "../../client/page/NewQuestion";

const meta: Meta = {
  title: "Page/NewQuestion",
  component: NewQuestion,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <NewQuestion account={mockAccount} appState={mockAppState} />
);
