import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockQClassStudentOrGuest,
} from "../mock";
import { ParticipantClassPage } from "../../client/component/ParticipantClassPage";

const meta: Meta<Props> = {
  title: "ParticipantClassPage",
  component: ParticipantClassPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<
  React.ComponentProps<typeof ParticipantClassPage>,
  "isDarkMode"
>;

export const Guest: Story<Props> = (args) => (
  <ParticipantClassPage
    appState={mockAppState}
    joinedClass={{
      class: {
        ...mockQClassStudentOrGuest,
        role: d.ClassParticipantRole.Guest,
      },
      participantList: undefined,
      questionTreeList: undefined,
    }}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);

export const Student: Story<Props> = (args) => (
  <ParticipantClassPage
    appState={mockAppState}
    joinedClass={{
      class: {
        ...mockQClassStudentOrGuest,
        role: d.ClassParticipantRole.Student,
      },
      participantList: undefined,
      questionTreeList: undefined,
    }}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
