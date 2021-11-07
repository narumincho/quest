import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { AppBar } from "../../client/component/AppBar";

const meta: Meta<Props> = {
  title: "AppBar",
  component: AppBar,
  args: {
    isDarkMode: false,
    isHideBack: false,
  },
};
export default meta;

type Props = Pick<
  React.ComponentProps<typeof AppBar>,
  "isHideBack" | "isDarkMode"
>;

export const NoLogIn: Story<Props> = (args) => (
  <AppBar
    isHideBack={args.isHideBack}
    appState={mockAppState}
    isDarkMode={args.isDarkMode}
  />
);
NoLogIn.args = {
  isHideBack: false,
};

export const LoggedIn: Story<Props> = (args) => (
  <AppBar
    isHideBack={args.isHideBack}
    appState={{
      ...mockAppState,
      logInState: { tag: "LoggedIn", loggedInState: mockLoggedInState },
    }}
    isDarkMode={args.isDarkMode}
  />
);
LoggedIn.args = {
  isHideBack: false,
};
