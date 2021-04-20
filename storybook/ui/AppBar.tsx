import { Meta, Story } from "@storybook/react";
import { AppBar } from "../../client/ui/AppBar";
import React from "react";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "ui/AppBar",
  component: AppBar,
};
export default meta;

export const Default: Story<never> = () => <AppBar appState={mockAppState} />;
