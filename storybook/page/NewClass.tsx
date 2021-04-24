import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { ClassNewPage } from "../../client/component/ClassNewPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/NewClass",
  component: ClassNewPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <ClassNewPage a={mockAppState} programId={mockProgramIdA} />
);
