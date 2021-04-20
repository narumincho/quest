import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { NewClass } from "../../client/page/NewClass";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/NewClass",
  component: NewClass,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <NewClass a={mockAppState} programId={mockProgramIdA} />
);
