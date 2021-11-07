import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState, mockProgramIdA } from "../mock";
import { ClassNewPage } from "../../client/component/ClassNewPage";

const meta: Meta<Props> = {
  title: "ClassNewPage",
  component: ClassNewPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof ClassNewPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <ClassNewPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    programId={mockProgramIdA}
    isDarkMode={args.isDarkMode}
  />
);
