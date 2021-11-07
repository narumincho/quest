import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { TextEditor } from "../../client/component/TextEditor";

const meta: Meta<Props> = {
  title: "TextEditor",
  component: TextEditor,
  args: {
    value:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta eligendi consequuntur nobis quia dolorem itaque voluptas expedita minima. Magni dolor voluptatum sint officiis soluta consequatur incidunt hic magnam minima commodi.",
    error: false,
    helperText: "helperText",
    label: "サンプルラベル",
    isDarkMode: false,
    multiline: false,
  },
};
export default meta;

type Props = Pick<
  Parameters<typeof TextEditor>[0],
  "value" | "error" | "helperText" | "label" | "isDarkMode" | "multiline"
>;

export const Default: Story<Props> = (args) => (
  <TextEditor
    value={args.value}
    error={args.error}
    helperText={args.helperText}
    label={args.label}
    onChangeOrReadonlyOrDisabled={() => {}}
    isDarkMode={args.isDarkMode}
    multiline={args.multiline}
  />
);

export const Readonly: Story<Props> = (args) => (
  <TextEditor
    value={args.value}
    error={args.error}
    helperText={args.helperText}
    label={args.label}
    onChangeOrReadonlyOrDisabled="readonly"
    isDarkMode={args.isDarkMode}
    multiline={args.multiline}
  />
);

export const Disabled: Story<Props> = (args) => (
  <TextEditor
    value={args.value}
    error={args.error}
    helperText={args.helperText}
    label={args.label}
    onChangeOrReadonlyOrDisabled="disabled"
    isDarkMode={args.isDarkMode}
    multiline={args.multiline}
  />
);

export const Error: Story<Props> = Default.bind({});
Error.args = {
  error: true,
};
