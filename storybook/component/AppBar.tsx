import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { AppBar } from "../../client/component/AppBar";

const meta: Meta<Props> = {
  title: "AppBar",
  component: AppBar,
  args: {
    isDarkMode: false,
    leftActionType: "back",
  },
};
export default meta;

type Props = Pick<
  React.ComponentProps<typeof AppBar>,
  "leftActionType" | "isDarkMode"
>;

export const NoLogIn: Story<Props> = (args) => (
  <AppBar
    leftActionType={args.leftActionType}
    appState={mockAppState}
    isDarkMode={args.isDarkMode}
  />
);
NoLogIn.args = {
  leftActionType: "none",
};

export const LoggedIn: Story<Props> = (args) => (
  <AppBar
    leftActionType={args.leftActionType}
    appState={{
      ...mockAppState,
      logInState: { tag: "LoggedIn", loggedInState: mockLoggedInState },
    }}
    isDarkMode={args.isDarkMode}
  />
);
LoggedIn.args = {
  leftActionType: "back",
};
