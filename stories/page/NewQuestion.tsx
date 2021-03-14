import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA, mockQuestionIdA } from "../mock";
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
  <NewQuestion
    appState={mockAppState}
    programId={mockProgramIdA}
    parent={undefined}
  />
);

export const WithParent: Story<never> = () => (
  <NewQuestion
    appState={mockAppState}
    programId={mockProgramIdA}
    parent={mockQuestionIdA}
  />
);
