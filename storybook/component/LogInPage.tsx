import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassInvitationToken } from "../mock";
import { LogInPage } from "../../client/component/LogInPage";

const meta: Meta = {
  title: "LogInPage",
  component: LogInPage,
};
export default meta;

export const Default: Story<never> = () => (
  <LogInPage appState={mockAppState} />
);

export const ToClassInvitationPage: Story<never> = () => (
  <LogInPage
    appState={{
      ...mockAppState,
      location: d.Location.ClassInvitation(mockClassInvitationToken),
    }}
  />
);
