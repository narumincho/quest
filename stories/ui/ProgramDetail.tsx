import { Meta, Story } from "@storybook/react";
import { ProgramDetail, Props } from "../../client/ui/ProgramDetail";
import React from "react";

const meta: Meta = {
  title: "ui/ProgramDetail",
  component: ProgramDetail,
};
export default meta;

export const Default: Story<Props> = (args) => <ProgramDetail {...args} />;
