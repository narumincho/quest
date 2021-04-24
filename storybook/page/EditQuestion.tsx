import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { mockAppState, muzintou } from "../mock";
import { EditQuestion } from "../../client/page/EditQuestion";
import { fullScreen } from "../decorators";

const meta: Meta = {
  title: "Page/EditQuestion",
  component: EditQuestion,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [fullScreen],
};
export default meta;

export const Default: Story<never> = () => (
  <EditQuestion appState={mockAppState} questionId={muzintou} />
);
