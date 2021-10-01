import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockQClassStudentOrGuest,
} from "../mock";
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
      class: {
        ...mockQClassStudentOrGuest,
        role: d.ClassParticipantRole.Guest,
      },
      participantList: undefined,
      questionTreeList: undefined,
    }}
    loggedInState={mockLoggedInState}
  />
);

export const Student: Story<never> = () => (
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
  />
);
