import * as React from "react";
import * as d from "../../data";
import { Meta, Story } from "@storybook/react";
import {
  mockAccount,
  mockAccount2,
  mockAccount3,
  mockAppState,
  mockClass,
  mockClassWithParticipantListLoadingParticipant,
  mockLoggedInState,
} from "../mock";
import { AdminClassPage } from "../../client/component/AdminClassPage";

const meta: Meta = {
  title: "AdminClassPage",
  component: AdminClassPage,
};
export default meta;

export const LoadingParticipantList: Story<never> = () => (
  <AdminClassPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classWithParticipantList={mockClassWithParticipantListLoadingParticipant}
  />
);

export const ZeroParticipant: Story<never> = () => (
  <AdminClassPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classWithParticipantList={{
      qClass: mockClass,
      participantList: [],
    }}
  />
);

export const LoadedParticipantList: Story<never> = () => (
  <AdminClassPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classWithParticipantList={{
      qClass: mockClass,
      participantList: [
        { account: mockAccount, role: "student", confirmedAnswerList: [] },
        { account: mockAccount2, role: "student", confirmedAnswerList: [] },
        { account: mockAccount3, role: "guest" },
      ],
    }}
  />
);
