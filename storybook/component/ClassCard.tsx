import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClass } from "../mock";
import { ClassCard } from "../../client/component/ClassCard";

const meta: Meta = {
  title: "ClassCard",
  component: ClassCard,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassCard class={mockClass} appState={mockAppState} />
);
