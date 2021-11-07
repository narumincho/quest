import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAppState,
  mockClassId,
  mockKadaiQuestionId,
  mockLoggedInState,
  mockManabiQuestionId,
} from "../mock";
import { StudentAnswerPage } from "../../client/component/StudentAnswerPage";

const meta: Meta<Props> = {
  title: "StudentAnswerPage",
  component: StudentAnswerPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<Parameters<typeof StudentAnswerPage>[0], "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <StudentAnswerPage
    appState={mockAppState}
    answerIdData={{
      answerStudentId: mockAccount.id,
      classId: mockClassId,
      questionId: mockKadaiQuestionId,
    }}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);

export const WithAnswer: Story<Props> = (args) => (
  <StudentAnswerPage
    appState={mockAppState}
    answerIdData={{
      answerStudentId: mockAccount.id,
      classId: mockClassId,
      questionId: mockManabiQuestionId,
    }}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
