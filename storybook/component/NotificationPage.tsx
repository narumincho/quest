import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { NotificationPage } from "../../client/component/NotificationPage";
import { mockAppState } from "../mock";

const meta: Meta = {
  title: "NotificationPage",
  component: NotificationPage,
};
export default meta;

export const Default: Story<never> = () => (
  <NotificationPage appState={mockAppState} />
);
