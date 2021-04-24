import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { LoadingPage } from "../../client/component/LoadingPage";

const meta: Meta = {
  title: "LoadingPage",
  component: LoadingPage,
};
export default meta;

export const Default: Story<never> = () => <LoadingPage />;
