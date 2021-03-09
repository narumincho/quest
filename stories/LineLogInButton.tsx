import { LineLoginButton, Props } from "../client/ui/LineLoginButton";
import { Meta } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "LineLoginButton",
  component: LineLoginButton,
};
export default meta;

export const Default: React.FC<Props> = (args) => <LineLoginButton {...args} />;
