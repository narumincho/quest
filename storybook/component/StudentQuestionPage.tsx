import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId, muzintou } from "../mock";
import { StudentEditQuestionPage } from "../../client/component/StudentEditQuestionPage";

const meta: Meta = {
  title: "StudentEditQuestionPage",
  component: StudentEditQuestionPage,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentEditQuestionPage
    appState={mockAppState}
    questionId={muzintou}
    classId={mockClassId}
  />
);
