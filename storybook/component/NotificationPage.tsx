import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { NotificationPage } from "../../client/component/NotificationPage";

const meta: Meta = {
  title: "NotificationPage",
  component: NotificationPage,
};
export default meta;

export const Default: Story<never> = () => (
  <NotificationPage appState={mockAppState} loggedInState={mockLoggedInState} />
);
