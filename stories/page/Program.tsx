import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Program, Props } from "../../client/page/Program";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "Page/Program",
  component: Program,
};
export default meta;

export const Default: Story<Props> = (args) => (
  <Program {...args} appState={fakeAppState} />
);
