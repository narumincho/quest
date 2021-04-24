import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { ProgramNewPage } from "../../client/component/ProgramNewPage";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "ProgramNewPage",
  component: ProgramNewPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramNewPage appState={mockAppState} />
);
