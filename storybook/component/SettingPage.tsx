import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState } from "../mock";
import { SettingPage } from "../../client/component/SettingPage";

const meta: Meta<Props> = {
  title: "SettingPage",
  component: SettingPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof SettingPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <SettingPage
    account={mockAccount}
    appState={mockAppState}
    isDarkMode={args.isDarkMode}
  />
);
