import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockQClassStudentOrGuest } from "../mock";
import { ParticipantClassPage } from "../../client/component/ParticipantClassPage";

const meta: Meta = {
  title: "ParticipantClassPage",
  component: ParticipantClassPage,
};
export default meta;

export const Guest: Story<never> = () => (
  <ParticipantClassPage
    appState={mockAppState}
    joinedClass={{
      role: d.QRole.Guest,
      class: mockQClassStudentOrGuest,
      participantList: undefined,
      questionTreeList: undefined,
    }}
  />
);

export const Student: Story<never> = () => (
  <ParticipantClassPage
    appState={mockAppState}
    joinedClass={{
      role: d.QRole.Student,
      class: mockQClassStudentOrGuest,
      participantList: undefined,
      questionTreeList: undefined,
    }}
  />
);
