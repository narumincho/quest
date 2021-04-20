import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Loading } from "../../client/page/Loading";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/Loading",
  component: Loading,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <>
    <Loading />
  </>
);
