import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState, mockProgramIdA } from "../mock";
import { ClassNewPage } from "../../client/component/ClassNewPage";

const meta: Meta = {
  title: "ClassNewPage",
  component: ClassNewPage,
};
export default meta;

export const Default: Story<never> = () => (
  <ClassNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
  />
);
