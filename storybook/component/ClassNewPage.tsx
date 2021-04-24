import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockProgramIdA } from "../mock";
import { ClassNewPage } from "../../client/component/ClassNewPage";

const meta: Meta = {
  title: "ClassNewPage",
  component: ClassNewPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassNewPage a={mockAppState} programId={mockProgramIdA} />
);
