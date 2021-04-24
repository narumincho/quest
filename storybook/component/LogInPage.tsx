import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { LogInPage } from "../../client/component/LogInPage";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "LogInPage",
  component: LogInPage,
};
export default meta;

export const Default: Story<never> = () => (
  <LogInPage appState={mockAppState} />
);
