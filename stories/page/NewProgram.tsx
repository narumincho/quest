import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NewProgram } from "../../client/page/NewProgram";
import { fullScreen } from "../../.storybook/decorators";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/NewProgram",
  component: NewProgram,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <NewProgram appState={mockAppState} />
);
