import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAccountId,
  mockAppState,
  mockClassId,
  mockLoggedInState,
} from "../mock";
import { AdminStudentPage } from "../../client/component/AdminStudentPage";

const meta: Meta = {
  title: "AdminStudentPage",
  component: AdminStudentPage,
};
export default meta;

export const Default: Story<never> = () => (
  <AdminStudentPage
    accountId={mockAccountId}
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classId={mockClassId}
  />
);
