import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA, muzintou } from "../mock";
import { QuestionNewPage } from "../../client/component/QuestionNewPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/NewQuestion",
  component: QuestionNewPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionNewPage
    appState={mockAppState}
    programId={mockProgramIdA}
    parent={undefined}
  />
);

export const WithParent: Story<never> = () => (
  <QuestionNewPage
    appState={mockAppState}
    programId={mockProgramIdA}
    parent={muzintou}
  />
);
