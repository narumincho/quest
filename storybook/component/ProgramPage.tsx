import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState, mockProgramIdA } from "../mock";
import { ProgramPage } from "../../client/component/ProgramPage";

const meta: Meta<Props> = {
  title: "ProgramPage",
  component: ProgramPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof ProgramPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <ProgramPage
    appState={mockAppState}
    programId={mockProgramIdA}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);
