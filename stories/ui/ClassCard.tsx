import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId } from "../mock";
import { ClassCard } from "../../client/ui";

const meta: Meta = {
  title: "ui/ClassCard",
  component: ClassCard,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassCard classId={mockClassId} a={mockAppState} />
);
