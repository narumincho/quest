import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccountId, mockAppState, mockLoggedInState } from "../mock";
import { AccountCard } from "../../client/component/AccountCard";

const meta: Meta = {
  title: "AccountCard",
  component: AccountCard,
};
export default meta;

export const Default: Story<never> = () => (
  <AccountCard accountId={mockAccountId} loggedInState={mockLoggedInState} />
);
