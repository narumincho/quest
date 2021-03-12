import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Login } from "../../client/page/Login";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/Login",
  component: Login,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => <Login appState={mockAppState} />;
