import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NewQuestion } from "../../client/page/NewQuestion";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/NewQuestion",
  component: NewQuestion,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <NewQuestion appState={mockAppState} />
);
