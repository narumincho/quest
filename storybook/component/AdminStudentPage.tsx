import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAccountId,
  mockAppState,
  mockClassId,
  mockLoggedInState,
} from "../mock";
import { AdminStudentPage } from "../../client/component/AdminStudentPage";

const meta: Meta<Props> = {
  title: "AdminStudentPage",
  component: AdminStudentPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof AdminStudentPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <AdminStudentPage
    accountId={mockAccountId}
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classId={mockClassId}
    isDarkMode={args.isDarkMode}
  />
);
