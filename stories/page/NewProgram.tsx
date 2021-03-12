import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAccountToken, mockAppState } from "../mock";
import { NewProgram } from "../../client/page/NewProgram";

const meta: Meta = {
  title: "Page/NewProgram",
  component: NewProgram,
};
export default meta;

export const Default: Story<never> = () => (
  <NewProgram
    account={mockAccount}
    accountToken={mockAccountToken}
    appState={mockAppState}
  />
);
