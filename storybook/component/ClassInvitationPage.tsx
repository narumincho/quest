import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassInvitationToken } from "../mock";
import { ClassInvitationPage } from "../../client/component/ClassInvitationPage";

const meta: Meta = {
  title: "ClassInvitationPage",
  component: ClassInvitationPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassInvitationPage
    appState={mockAppState}
    classInvitationToken={mockClassInvitationToken}
  />
);
