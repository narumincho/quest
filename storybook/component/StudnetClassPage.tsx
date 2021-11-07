import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAccount2,
  mockAccount3,
  mockAppState,
  mockLoggedInState,
  mockQClassStudentOrGuest,
  mockStudentSelfQuestionTreeList,
} from "../mock";
import { StudentClassPage } from "../../client/component/StudentClassPage";

const meta: Meta<Props> = {
  title: "StudentClassPage",
  component: StudentClassPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof StudentClassPage>, "isDarkMode">;

export const Loading: Story<Props> = (args) => (
  <StudentClassPage
    appState={mockAppState}
    participantList={undefined}
    participantClass={mockQClassStudentOrGuest}
    questionTreeList={undefined}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);

export const Loaded: Story<Props> = (args) => (
  <StudentClassPage
    appState={mockAppState}
    participantList={[
      { account: mockAccount, role: d.ClassParticipantRole.Student },
      { account: mockAccount2, role: d.ClassParticipantRole.Student },
      { account: mockAccount3, role: d.ClassParticipantRole.Guest },
    ]}
    participantClass={mockQClassStudentOrGuest}
    questionTreeList={mockStudentSelfQuestionTreeList}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
