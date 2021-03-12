import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Props, Setting } from "../../client/page/Setting";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "Page/Setting",
  component: Setting,
};
export default meta;

export const Default: Story<Props> = (args) => (
  <Setting {...args} appState={fakeAppState} />
);
