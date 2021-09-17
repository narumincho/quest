import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockClassId,
  mockKadaiQuestionId,
  mockLoggedInState,
  mockManabiQuestionId,
} from "../mock";
import { StudentAnswerPage } from "../../client/component/StudentAnswerPage";

const meta: Meta = {
  title: "StudentAnswerPage",
  component: StudentAnswerPage,
};
export default meta;

export const Default: Story<never> = () => (
  <StudentAnswerPage
    appState={mockAppState}
    questionId={mockKadaiQuestionId}
    classId={mockClassId}
    loggedInState={mockLoggedInState}
  />
);

export const WithAnswer: Story<never> = () => (
  <StudentAnswerPage
    appState={mockAppState}
    questionId={mockManabiQuestionId}
    classId={mockClassId}
    loggedInState={mockLoggedInState}
  />
);
