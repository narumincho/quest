import * as React from "react";
import { AdminTop, Props } from "../../client/page/AdminTop";
import { Meta, Story } from "@storybook/react";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "Page/AdminTop",
  component: AdminTop,
};
export default meta;

export const Default: Story<Props> = (args) => (
  <AdminTop {...args} appState={fakeAppState} />
);
