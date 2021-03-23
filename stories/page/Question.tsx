import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { Question } from "../../client/page/Question";
import { fullScreen } from "../../.storybook/decorators";

const meta: Meta = {
  title: "Page/Question",
  component: Question,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <Question appState={mockAppState} questionId={muzintou} />
);
