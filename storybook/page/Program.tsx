import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { ProgramPage } from "../../client/component/ProgramPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/Program",
  component: ProgramPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramPage appState={mockAppState} programId={mockProgramIdA} />
);
