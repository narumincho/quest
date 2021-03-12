import * as React from "react";
import { Login, Props } from "../../client/page/Login";
import { Meta, Story } from "@storybook/react";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "Page/Login",
  component: Login,
};
export default meta;

export const Default: Story<Props> = (args) => (
  <Login {...args} appState={fakeAppState} />
);
