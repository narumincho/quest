import * as React from "react";
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

const meta: Meta<Props> = {
  title: "AdminClassPage",
  component: AdminClassPage,
  args: {
    isDarkMode: false,
  },
};
export default meta;

type Props = Pick<React.ComponentProps<typeof AdminClassPage>, "isDarkMode">;

export const LoadingParticipantList: Story<Props> = (args) => (
  <AdminClassPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classWithParticipantList={mockClassWithParticipantListLoadingParticipant}
    isDarkMode={args.isDarkMode}
  />
);

export const ZeroParticipant: Story<Props> = (args) => (
  <AdminClassPage
    appState={mockAppState}
    loggedInState={mockLoggedInState}
    classWithParticipantList={{
      qClass: mockClass,
      participantList: [],
    }}
    isDarkMode={args.isDarkMode}
  />
);

export const LoadedParticipantList: Story<Props> = (args) => (
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
    isDarkMode={args.isDarkMode}
  />
);
