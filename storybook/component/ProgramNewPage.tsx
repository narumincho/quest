import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { ProgramNewPage } from "../../client/component/ProgramNewPage";
import { mockAppState } from "../mock";

const meta: Meta<Props> = {
  title: "ProgramNewPage",
  component: ProgramNewPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof ProgramNewPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <ProgramNewPage appState={mockAppState} isDarkMode={args.isDarkMode} />
);
