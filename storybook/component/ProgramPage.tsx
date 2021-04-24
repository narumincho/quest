import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { ProgramPage } from "../../client/component/ProgramPage";

const meta: Meta = {
  title: "ProgramPage",
  component: ProgramPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramPage appState={mockAppState} programId={mockProgramIdA} />
);
