import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockQClassStudentOrGuest } from "../mock";
import { StudentClassPage } from "../../client/component/StudentClassPage";

const meta: Meta = {
  title: "StudentClassPage",
  component: StudentClassPage,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentClassPage
    appState={mockAppState}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);
