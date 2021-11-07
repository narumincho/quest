import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassInvitationToken } from "../mock";
import { ClassInvitationPage } from "../../client/component/ClassInvitationPage";

const meta: Meta<Props> = {
  title: "ClassInvitationPage",
  component: ClassInvitationPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<
  React.ComponentProps<typeof ClassInvitationPage>,
  "isDarkMode"
>;

export const Default: Story<Props> = (args) => (
  <ClassInvitationPage
    appState={mockAppState}
    studentClassInvitationToken={mockClassInvitationToken}
    isDarkMode={args.isDarkMode}
  />
);
