import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockClassId,
  mockLoggedInState,
  mockStudentSelfQuestionTreeList,
} from "../mock";
import { StudentSelfQuestionTreeList } from "../../client/component/StudentSelfQuestionTreeList";

const meta: Meta = {
  title: "StudentSelfQuestionTreeList",
  component: StudentSelfQuestionTreeList,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentSelfQuestionTreeList
    treeList={mockStudentSelfQuestionTreeList}
    classId={mockClassId}
    appState={mockAppState}
    loggedInState={mockLoggedInState}
  />
);
