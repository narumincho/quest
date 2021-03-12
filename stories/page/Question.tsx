import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAccount, mockAppState, mockQuestionIdA } from "../mock";
import { Question } from "../../client/page/Question";

const meta: Meta = {
  title: "Page/Question",
  component: Question,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Default: Story<never> = () => (
  <Question
    account={mockAccount}
    appState={mockAppState}
    questionId={mockQuestionIdA}
  />
);
