import * as React from "react";
import { TextField } from "@mui/material";

export const TextEditor = (props: {
  readonly value: string;
  readonly onChangeOrReadonlyOrDisabled:
    | ((newText: string) => void)
    | "readonly"
    | "disabled";
  readonly error: boolean;
  readonly label: string;
  readonly helperText: string;
  readonly dataCy?: string | undefined;
  readonly isDarkMode: boolean;
  readonly multiline: boolean;
}): React.ReactElement => {
  return (
    <TextField
      multiline={props.multiline}
      required
      fullWidth
      label={props.label}
      value={props.value}
      onChange={(e) => {
        if (typeof props.onChangeOrReadonlyOrDisabled !== "string") {
          props.onChangeOrReadonlyOrDisabled(e.target.value);
        }
      }}
      error={props.error}
      helperText={props.helperText}
      variant="outlined"
      sx={{
        backgroundColor: props.isDarkMode ? "#111" : "#fefefe",
        color: props.isDarkMode ? "#fefefe" : "#111",
      }}
      disabled={props.onChangeOrReadonlyOrDisabled === "disabled"}
      InputProps={{
        readOnly: props.onChangeOrReadonlyOrDisabled === "readonly",
        sx: {
          backgroundColor: props.isDarkMode ? "#111" : "#fefefe",
          color: props.isDarkMode ? "#fefefe" : "#111",
          borderColor: "yellow",
        },
      }}
      InputLabelProps={{
        sx: {
          backgroundColor: props.isDarkMode ? "#111" : "#fefefe",
          color: props.isDarkMode ? "#fefefe" : "#111",
        },
      }}
      FormHelperTextProps={{
        sx: {
          backgroundColor: props.isDarkMode ? "#111" : "#fefefe",
          color: props.isDarkMode ? "#fefefe" : "#111",
        },
      }}
      data-cy={props.dataCy}
    />
  );
};
