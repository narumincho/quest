import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { StudentQuestionPage } from "../../client/component/StudentQuestionPage";

const meta: Meta = {
  title: "StudentQuestionPage",
  component: StudentQuestionPage,
};
export default meta;

export const Default: Story<never> = () => <StudentQuestionPage />;
