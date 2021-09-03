import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  muzintou,
} from "../mock";
import { QuestionEditPage } from "../../client/component/QuestionEditPage";

const meta: Meta = {
  title: "QuestionEditPage",
  component: QuestionEditPage,
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionEditPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    questionId={muzintou}
    programId={mockProgramIdA}
  />
);
