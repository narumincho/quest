import { LineLoginButton, Props } from "../../client/ui/LineLoginButton";
import { Meta, Story } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "ui/LineLoginButton",
  component: LineLoginButton,
};
export default meta;

export const Default: Story<Props> = (args) => <LineLoginButton {...args} />;
