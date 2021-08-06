import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Props, TopPage } from "../../client/component/TopPage";
import { mockAppState, mockLoggedInState } from "../mock";

const meta: Meta = {
  title: "TopPage",
  component: TopPage,
};
export default meta;

export const Default: Story<Props> = () => (
  <TopPage appState={mockAppState} loggedInState={mockLoggedInState} />
);

export const Empty: Story<Props> = () => (
  <TopPage
    appState={mockAppState}
    loggedInState={{
      ...mockLoggedInState,
      createdProgramMap: new Map(),
      joinedClassMap: new Map(),
    }}
  />
);
