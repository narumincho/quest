import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { NotificationPage } from "../../client/component/NotificationPage";

const meta: Meta<Props> = {
  title: "NotificationPage",
  component: NotificationPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof NotificationPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <NotificationPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
