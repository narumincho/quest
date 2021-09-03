import * as React from "react";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  muzintou,
} from "../mock";
import { QuestionNewPage } from "../../client/component/QuestionNewPage";

const meta: Meta = {
  title: "QuestionNewPage",
  component: QuestionNewPage,
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
    parent={undefined}
  />
);

export const WithParent: Story<never> = () => (
  <QuestionNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
    parent={muzintou}
  />
);
