import * as React from "react";
import { AdminTopPage, Props } from "../../client/component/AdminTopPage";
import { Meta, Story } from "@storybook/react";
import {
  mockAppState,
  mockProgramIdA,
  mockProgramIdB,
  mockProgramIdLong,
} from "../mock";

const meta: Meta = {
  title: "AdminTopPage",
  component: AdminTopPage,
};
export default meta;

export const Loading: Story<Props> = () => (
  <AdminTopPage appState={mockAppState} />
);

export const Requesting: Story<Props> = () => (
  <AdminTopPage
    appState={{
      ...mockAppState,
      createdProgramListState: { tag: "Requesting" },
    }}
  />
);

export const Loaded: Story<Props> = () => (
  <AdminTopPage
    appState={{
      ...mockAppState,
      createdProgramListState: {
        tag: "Loaded",
        projectIdList: [mockProgramIdA, mockProgramIdB, mockProgramIdLong],
      },
    }}
  />
);

export const LoadedZero: Story<Props> = () => (
  <AdminTopPage
    appState={{
      ...mockAppState,
      createdProgramListState: {
        tag: "Loaded",
        projectIdList: [],
      },
    }}
  />
);
