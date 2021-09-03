import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  mockProgramIdLong,
} from "../mock";
import { ProgramCard } from "../../client/component/ProgramCard";
import React from "react";

const meta: Meta = {
  title: "ProgramCard",
  component: ProgramCard,
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramCard
    programId={mockProgramIdA}
    appState={mockAppState}
    createdProgramMap={mockLoggedInState.createdProgramMap}
  />
);

export const Long: Story<never> = () => (
  <ProgramCard
    programId={mockProgramIdLong}
    appState={mockAppState}
    createdProgramMap={mockLoggedInState.createdProgramMap}
  />
);
