import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { LoadingPage } from "../../client/component/LoadingPage";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/Loading",
  component: LoadingPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <>
    <LoadingPage />
  </>
);
