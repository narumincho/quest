import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassInvitationToken } from "../mock";
import { LogInPage } from "../../client/component/LogInPage";

const meta: Meta<Props> = {
  title: "LogInPage",
  component: LogInPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof LogInPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <LogInPage appState={mockAppState} isDarkMode={args.isDarkMode} />
);

export const ToClassInvitationPage: Story<Props> = (args) => (
  <LogInPage
    appState={{
      ...mockAppState,
      location: d.Location.ClassInvitation(mockClassInvitationToken),
    }}
    isDarkMode={args.isDarkMode}
  />
);
