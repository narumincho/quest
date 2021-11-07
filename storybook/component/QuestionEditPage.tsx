import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  muzintou,
} from "../mock";
import { QuestionEditPage } from "../../client/component/QuestionEditPage";

const meta: Meta<Props> = {
  title: "QuestionEditPage",
  component: QuestionEditPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<Parameters<typeof QuestionEditPage>[0], "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <QuestionEditPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    questionId={muzintou}
    programId={mockProgramIdA}
    isDarkMode={args.isDarkMode}
  />
);
