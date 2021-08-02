import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockQClassStudentOrGuest } from "../mock";
import { GuestClassPage } from "../../client/component/GuestClassPage";

const meta: Meta = {
  title: "GuestClassPage",
  component: GuestClassPage,
};
export default meta;

export const Default: Story<never> = () => (
  <GuestClassPage
    appState={mockAppState}
    qClassForParticipant={mockQClassStudentOrGuest}
  />
);
