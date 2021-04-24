import { Meta, Story } from "@storybook/react";
import { LineLoginButton } from "../../client/component/LineLoginButton";
import React from "react";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "LineLoginButton",
  component: LineLoginButton,
};
export default meta;

export const Default: Story<never> = () => (
  <LineLoginButton appState={mockAppState} />
);
