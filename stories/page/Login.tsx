import * as React from "react";
import { Login, Props } from "../../client/page/Login";
import { Meta, Story } from "@storybook/react";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "Page/Login",
  component: Login,
};
export default meta;

export const Default: Story<never> = () => <Login appState={mockAppState} />;
