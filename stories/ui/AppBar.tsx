import { AppBar, Props } from "../../client/ui/AppBar";
import { Meta, Story } from "@storybook/react";
import React from "react";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "ui/AppBar",
  component: AppBar,
};
export default meta;

export const Default: Story<Props> = (args) => <AppBar {...args} />;
Default.args = {
  title: "タイトル",
  appState: fakeAppState,
};
