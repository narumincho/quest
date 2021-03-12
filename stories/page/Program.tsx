import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState, mockProgramId } from "../mock";
import { Program } from "../../client/page/Program";

const meta: Meta = {
  title: "Page/Program",
  component: Program,
};
export default meta;

export const Default: Story<never> = () => (
  <Program
    account={mockAccount}
    appState={mockAppState}
    programId={mockProgramId}
  />
);
