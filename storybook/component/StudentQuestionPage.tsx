import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockClassId,
  mockKadaiQuestionId,
  mockManabiQuestionId,
} from "../mock";
import { StudentEditQuestionPage } from "../../client/component/StudentEditQuestionPage";

const meta: Meta = {
  title: "StudentEditQuestionPage",
  component: StudentEditQuestionPage,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentEditQuestionPage
    appState={mockAppState}
    questionId={mockKadaiQuestionId}
    classId={mockClassId}
  />
);

export const WithAnswer: Story<never> = () => (
  <StudentEditQuestionPage
    appState={mockAppState}
    questionId={mockManabiQuestionId}
    classId={mockClassId}
  />
);
