import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { AppBar } from "../../client/component/AppBar";

const meta: Meta = {
  title: "AppBar",
  component: AppBar,
};
export default meta;

export const NoLogIn: Story<{ readonly isHideBack: boolean }> = (props) => (
  <AppBar isHideBack={props.isHideBack} appState={mockAppState} />
);
NoLogIn.args = {
  isHideBack: false,
};

export const LoggedIn: Story<{ readonly isHideBack: boolean }> = (props) => (
  <AppBar
    isHideBack={props.isHideBack}
    appState={{
      ...mockAppState,
      logInState: { tag: "LoggedIn", loggedInState: mockLoggedInState },
    }}
  />
);
LoggedIn.args = {
  isHideBack: false,
};
