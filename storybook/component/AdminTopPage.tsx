import * as React from "react";
import { AdminTopPage, Props } from "../../client/component/AdminTopPage";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockLoggedInState,
  mockProgramIdA,
  mockProgramIdB,
  mockProgramIdLong,
} from "../mock";

const meta: Meta = {
  title: "AdminTopPage",
  component: AdminTopPage,
};
export default meta;

export const Default: Story<Props> = () => (
  <AdminTopPage appState={mockAppState} loggedInState={mockLoggedInState} />
);

export const Empty: Story<Props> = () => (
  <AdminTopPage
    appState={mockAppState}
    loggedInState={{ ...mockLoggedInState, createdProgramList: new Map() }}
  />
);
