import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  ParticipantClassPage,
  Props as ParticipantClassPageProps,
} from "../../client/component/ParticipantClassPage";
import { mockAppState, mockQClassStudentOrGuest } from "../mock";

const meta: Meta = {
  title: "ParticipantClassPage",
  component: ParticipantClassPage,
};
export default meta;

export const Guest: Story<never> = () => (
  <ParticipantClassPage
    appState={mockAppState}
    role={d.QRole.Guest}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);

export const Student: Story<never> = () => (
  <ParticipantClassPage
    appState={mockAppState}
    role={d.QRole.Student}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);
