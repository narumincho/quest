import * as React from "react";
import { Button } from "@material-ui/core";

type Props = Record<never, never>;

export const LineLogInButton: React.FunctionComponent<Props> = () => {
  return (
    <Button
      variant="contained"
      onClick={() => {
        console.log("lineログインボタンを押した");
      }}
    >
      LINE で ログイン
    </Button>
  );
};
