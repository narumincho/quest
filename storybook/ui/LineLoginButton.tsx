import { Meta, Story } from "@storybook/react";
import { LineLoginButton } from "../../client/ui/LineLoginButton";
import React from "react";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "ui/LineLoginButton",
  component: LineLoginButton,
};
export default meta;

export const Default: Story<never> = () => (
  <LineLoginButton appState={mockAppState} />
);