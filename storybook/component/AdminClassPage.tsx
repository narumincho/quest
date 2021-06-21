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
        { first: mockAccount, second: d.QRole.Student },
        { first: mockAccount2, second: d.QRole.Student },
        { first: mockAccount3, second: d.QRole.Guest },
      ],
    }}
  />
);
