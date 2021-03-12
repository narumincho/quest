import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NewProgram, Props } from "../../client/page/NewProgram";
import { fakeAppState } from "../fakeState";

const meta: Meta = {
  title: "Page/NewProgram",
  component: NewProgram,
};
export default meta;

export const Default: Story<Props> = (args) => (
  <NewProgram {...args} appState={fakeAppState} />
);
