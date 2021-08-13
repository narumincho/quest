import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { StudentSelfQuestionTreeList } from "../../client/component/StudentSelfQuestionTreeList";
import { mockStudentSelfQuestionTreeList } from "../mock";

const meta: Meta = {
  title: "StudentSelfQuestionTreeList",
  component: StudentSelfQuestionTreeList,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentSelfQuestionTreeList treeList={mockStudentSelfQuestionTreeList} />
);
