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
} from "../mock";
import { AdminClassPage } from "../../client/component/AdminClassPage";

const meta: Meta = {
  title: "AdminClassPage",
  component: AdminClassPage,
};
export default meta;

export const LoadingParticipantList: Story<never> = () => (
  <AdminClassPage
    a={mockAppState}
    classWithParticipantList={mockClassWithParticipantListLoadingParticipant}
  />
);

export const ZeroParticipant: Story<never> = () => (
  <AdminClassPage
    a={mockAppState}
    classWithParticipantList={{
      qClass: mockClass,
      participantList: [],
    }}
  />
);

export const LoadedParticipantList: Story<never> = () => (
  <AdminClassPage
    a={mockAppState}
    classWithParticipantList={{
      qClass: mockClass,
      participantList: [
        { account: mockAccount, role: d.ClassParticipantRole.Student },
        { account: mockAccount2, role: d.ClassParticipantRole.Student },
        { account: mockAccount3, role: d.ClassParticipantRole.Guest },
      ],
    }}
  />
);
