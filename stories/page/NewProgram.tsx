import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NewProgram } from "../../client/page/NewProgram";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/NewProgram",
  component: NewProgram,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <NewProgram appState={mockAppState} />
);
