import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockClassId } from "../mock";
import { AdminClassPage } from "../../client/component/AdminClassPage";

const meta: Meta = {
  title: "AdminClassPage",
  component: AdminClassPage,
};
export default meta;

export const Default: Story<never> = () => (
  <AdminClassPage a={mockAppState} classId={mockClassId} />
);
