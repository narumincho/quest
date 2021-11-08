import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccountId, mockLoggedInState } from "../mock";
import { AccountCard } from "../../client/component/AccountCard";

const meta: Meta<Props> = {
  title: "AccountCard",
  component: AccountCard,
  args: {
    accountId: mockAccountId,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof AccountCard>, "accountId">;

export const Default: Story<Props> = (args) => (
  <AccountCard accountId={args.accountId} loggedInState={mockLoggedInState} />
);
