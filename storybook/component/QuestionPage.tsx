import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  muzintou,
} from "../mock";
import { QuestionPage } from "../../client/component/QuestionPage";
const meta: Meta = {
  title: "QuestionPage",
  component: QuestionPage,
};
export default meta;

type Props = Pick<React.ComponentProps<typeof QuestionPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <QuestionPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    questionId={muzintou}
    programId={mockProgramIdA}
    isDarkMode={args.isDarkMode}
  />
);
