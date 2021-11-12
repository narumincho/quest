import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount2,
  mockAccountId,
  mockAppState,
  mockClassId,
  mockKadaiQuestionId,
  mockLoggedInState,
} from "../mock";
import { CommentAndAnswersFromOtherStudents } from "../../client/component/CommentAndAnswersFromOtherStudents";

type Args = Pick<
  React.ComponentProps<typeof CommentAndAnswersFromOtherStudents>,
  "isDarkMode"
>;

const meta: Meta<Args> = {
  title: "CommentAndAnswersFromOtherStudents",
  component: CommentAndAnswersFromOtherStudents,
  args: {
    isDarkMode: false,
  },
};

export default meta;

export const Default: Story<Args> = (args) => {
  return (
    <CommentAndAnswersFromOtherStudents
      appState={mockAppState}
      classId={mockClassId}
      questionId={mockKadaiQuestionId}
      answerStudentId={mockAccountId}
      answersFromOtherStudents={[
        {
          answerText: "他の生徒の回答文",
          studentId: mockAccount2.id,
        },
      ]}
      isDarkMode={args.isDarkMode}
      loggedInState={mockLoggedInState}
    />
  );
};
