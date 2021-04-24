import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId } from "../mock";
import { ClassPage } from "../../client/component/ClassPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/Class",
  component: ClassPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <ClassPage a={mockAppState} classId={mockClassId} />
);
