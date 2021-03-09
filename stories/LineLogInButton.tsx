import { LineLogInButton, Props } from "../client/ui/LineLoginButton";
import { Meta } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "LineLogInButton",
  component: LineLogInButton,
};
export default meta;

export const Default: React.FC<Props> = (args) => <LineLogInButton {...args} />;
