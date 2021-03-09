import { AppBar, Props } from "../client/ui/AppBar";
import { Meta, Story } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "AppBar",
  component: AppBar,
};
export default meta;

export const Default: Story<Props> = (args) => <AppBar {...args} />;
Default.args = {
  title: "タイトル",
};
