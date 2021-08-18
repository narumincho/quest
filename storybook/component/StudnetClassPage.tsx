import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAccount2,
  mockAccount3,
  mockAppState,
  mockQClassStudentOrGuest,
  mockStudentSelfQuestionTreeList,
} from "../mock";
import { StudentClassPage } from "../../client/component/StudentClassPage";

const meta: Meta = {
  title: "StudentClassPage",
  component: StudentClassPage,
};
export default meta;

export const Loading: Story<never> = () => (
  <StudentClassPage
    appState={mockAppState}
    participantList={undefined}
    participantClass={mockQClassStudentOrGuest}
    questionTreeList={undefined}
  />
);

export const Loaded: Story<never> = () => (
  <StudentClassPage
    appState={mockAppState}
    participantList={[
      { account: mockAccount, role: d.ClassParticipantRole.Student },
      { account: mockAccount2, role: d.ClassParticipantRole.Student },
      { account: mockAccount3, role: d.ClassParticipantRole.Guest },
    ]}
    participantClass={mockQClassStudentOrGuest}
    questionTreeList={mockStudentSelfQuestionTreeList}
  />
);
