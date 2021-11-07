import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockQClassStudentOrGuest } from "../mock";
import { GuestClassPage } from "../../client/component/GuestClassPage";

const meta: Meta<Props> = {
  title: "GuestClassPage",
  component: GuestClassPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof GuestClassPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <GuestClassPage
    appState={mockAppState}
    participantClass={mockQClassStudentOrGuest}
    isDarkMode={args.isDarkMode}
  />
);
