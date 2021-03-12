import * as React from "react";
import { AdminTop, Props } from "../../client/page/AdminTop";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAppState,
  mockProgramIdA,
  mockProgramIdB,
  mockProgramIdLong,
} from "../mock";

const meta: Meta = {
  title: "Page/AdminTop",
  component: AdminTop,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

export const Loading: Story<Props> = () => (
  <AdminTop account={mockAccount} appState={mockAppState} />
);

export const Requesting: Story<Props> = () => (
  <AdminTop
    account={mockAccount}
    appState={{
      ...mockAppState,
      createdProgramListState: { tag: "Requesting" },
    }}
  />
);

export const Loaded: Story<Props> = () => (
  <AdminTop
    account={mockAccount}
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
  <AdminTop
    account={mockAccount}
    appState={{
      ...mockAppState,
      createdProgramListState: {
        tag: "Loaded",
        projectIdList: [],
      },
    }}
  />
);
