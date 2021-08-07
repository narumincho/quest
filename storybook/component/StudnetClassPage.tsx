import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAccount2,
  mockAccount3,
  mockAppState,
  mockQClassStudentOrGuest,
} from "../mock";
import { StudentClassPage } from "../../client/component/StudentClassPage";

const meta: Meta = {
  title: "StudentClassPage",
  component: StudentClassPage,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentClassPage
    appState={mockAppState}
    participantList={undefined}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);

export const WithParticipantList: Story<never> = () => (
  <StudentClassPage
    appState={mockAppState}
    participantList={[
      { first: mockAccount, second: d.QRole.Student },
      { first: mockAccount2, second: d.QRole.Student },
      { first: mockAccount3, second: d.QRole.Guest },
    ]}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);
