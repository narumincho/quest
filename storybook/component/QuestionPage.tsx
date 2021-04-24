import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { QuestionPage } from "../../client/component/QuestionPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "QuestionPage",
  component: QuestionPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionPage appState={mockAppState} questionId={muzintou} />
);
