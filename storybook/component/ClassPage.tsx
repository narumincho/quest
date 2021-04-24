import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId } from "../mock";
import { ClassPage } from "../../client/component/ClassPage";

const meta: Meta = {
  title: "ClassPage",
  component: ClassPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassPage a={mockAppState} classId={mockClassId} />
);
