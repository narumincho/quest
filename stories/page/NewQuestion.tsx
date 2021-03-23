import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA, muzintou } from "../mock";
import { NewQuestion } from "../../client/page/NewQuestion";
import { fullScreen } from "../../.storybook/decorators";

const meta: Meta = {
  title: "Page/NewQuestion",
  component: NewQuestion,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
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
    parent={muzintou}
  />
);
