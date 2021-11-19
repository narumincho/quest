import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAppState,
  mockClassId,
  mockKadaiQuestionId,
  mockLoggedInAppState,
  mockLoggedInState,
  muzintou,
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

type Props = Pick<React.ComponentProps<typeof StudentAnswerPage>, "isDarkMode">;

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
    appState={mockLoggedInAppState}
    answerIdData={{
      answerStudentId: mockAccount.id,
      classId: mockClassId,
      questionId: muzintou,
    }}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
