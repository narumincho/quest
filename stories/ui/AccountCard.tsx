import { AccountCard, Props } from "../../client/ui/AccountCard";
import { Meta, Story } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "ui/AccountCard",
  component: AccountCard,
};
export default meta;

export const Default: Story<Props> = (args) => <AccountCard {...args} />;
