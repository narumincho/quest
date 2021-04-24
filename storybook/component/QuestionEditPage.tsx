import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { QuestionEditPage } from "../../client/component/QuestionEditPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "QuestionEditPage",
  component: QuestionEditPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionEditPage appState={mockAppState} questionId={muzintou} />
);
