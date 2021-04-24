import { Meta, Story } from "@storybook/react";
import { AppBar } from "../../client/component/AppBar";
import React from "react";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "AppBar",
  component: AppBar,
};
export default meta;

export const Default: Story<{ isHideBack: boolean }> = (props) => (
  <AppBar isHideBack={props.isHideBack} appState={mockAppState} />
);
