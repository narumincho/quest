import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { QuestionPage } from "../../client/component/QuestionPage";
const meta: Meta = {
  title: "QuestionPage",
  component: QuestionPage,
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionPage appState={mockAppState} questionId={muzintou} />
);
