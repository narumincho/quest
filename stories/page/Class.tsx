import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId } from "../mock";
import { Class } from "../../client/page/Class";
import { fullScreen } from "../../.storybook/decorators";

const meta: Meta = {
  title: "Page/Class",
  component: Class,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <Class a={mockAppState} classId={mockClassId} />
);
