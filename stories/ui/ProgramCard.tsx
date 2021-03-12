import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA, mockProgramIdLong } from "../mock";
import { ProgramCard } from "../../client/ui/ProgramCard";
import React from "react";

const meta: Meta = {
  title: "ui/ProgramCard",
  component: ProgramCard,
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramCard programId={mockProgramIdA} appState={mockAppState} />
);

export const Long: Story<never> = () => (
  <ProgramCard programId={mockProgramIdLong} appState={mockAppState} />
);
