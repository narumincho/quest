import * as React from "react";
import { Box, Button, TextField, Typography } from "@material-ui/core";

export const Content: React.FC<Record<never, never>> = () => {
  const [state, setState] = React.useState<string>("");
  const trimmedAnswer = state.trim();
  const validAnswer = trimmedAnswer.length !== 0;

  return (
    <Box padding={1}>
      <Typography variant="subtitle1">
        あなたが楽しいと感じる出来事は何ですか?
      </Typography>
      <TextField
        required
        multiline
        fullWidth
        autoFocus
        value={state}
        onChange={(e) => setState(e.target.value)}
        rows={10}
        variant="filled"
      />
      {validAnswer ? (
        <Button variant="contained" color="primary">
          次の問題へ
        </Button>
      ) : (
        <></>
      )}
    </Box>
  );
};
