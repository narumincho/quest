import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { ProgramNewPage } from "../../client/component/ProgramNewPage";
import { fullScreen } from "../decorators";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "ProgramNewPage",
  component: ProgramNewPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <ProgramNewPage appState={mockAppState} />
);
