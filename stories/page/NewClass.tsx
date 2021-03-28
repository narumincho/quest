import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NewClass } from "../../client/page/NewClass";
import { fullScreen } from "../../.storybook/decorators";
import { mockProgramIdA } from "../mock";

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
  <NewClass programId={mockProgramIdA} />
);
