import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState, mockProgramIdA } from "../mock";
import { Program } from "../../client/page/Program";

const meta: Meta = {
  title: "Page/Program",
  component: Program,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <Program
    account={mockAccount}
    appState={mockAppState}
    programId={mockProgramIdA}
  />
);
