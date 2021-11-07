import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, mockLoggedInState } from "../mock";
import { TopPage } from "../../client/component/TopPage";

const meta: Meta<Props> = {
  title: "TopPage",
  component: TopPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof TopPage>, "isDarkMode">;

export const Default: Story<Props> = (args) => (
  <TopPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    isDarkMode={args.isDarkMode}
  />
);

export const Empty: Story<Props> = (args) => (
  <TopPage
    appState={mockAppState}
    loggedInState={{
      ...mockLoggedInState,
      createdProgramMap: new Map(),
      joinedClassMap: new Map(),
    }}
    isDarkMode={args.isDarkMode}
  />
);
