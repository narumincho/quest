import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Class } from "../../client/page/Class";
import { fullScreen } from "../../.storybook/decorators";
import { mockClassId } from "../mock";

const meta: Meta = {
  title: "Page/Class",
  component: Class,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => <Class classId={mockClassId} />;
