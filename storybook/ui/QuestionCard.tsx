import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { QuestionCard } from "../../client/ui/QuestionCard";

const meta: Meta = {
  title: "ui/QuestionCard",
  component: QuestionCard,
};
export default meta;

export const Default: Story<never> = () => (
  <QuestionCard questionId={muzintou} appState={mockAppState} />
);