import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  muzintou,
} from "../mock";
import { QuestionNewPage } from "../../client/component/QuestionNewPage";

const meta: Meta<Props> = {
  title: "QuestionNewPage",
  component: QuestionNewPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<Parameters<typeof QuestionNewPage>[0], "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <QuestionNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
    parent={undefined}
    isDarkMode={args.isDarkMode}
  />
);

export const WithParent: Story<Props> = (args) => (
  <QuestionNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
    parent={muzintou}
    isDarkMode={args.isDarkMode}
  />
);
