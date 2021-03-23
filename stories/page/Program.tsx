import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { Program } from "../../client/page/Program";
import { fullScreen } from "../../.storybook/decorators";

const meta: Meta = {
  title: "Page/Program",
  component: Program,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <Program appState={mockAppState} programId={mockProgramIdA} />
);
