import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppBar } from "../ui";
import { AppState } from "../state";
import { api } from "../api";
import { stringToValidProjectName } from "../../common/validation";

export type Props = {
  readonly accountToken: d.AccountToken;
  readonly account: d.QAccount;
  readonly appState: AppState;
};

const useStyles = makeStyles({
  createButton: {
    textTransform: "none",
  },
});

export const NewProgram: React.VFC<Props> = (props) => {
  const classes = useStyles();
  const [projectName, setProjectName] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const projectNameResult = stringToValidProjectName(projectName);

  const createProgram = () => {
    setIsFirst(false);
    if (isCreating) {
      return;
    }
    if (projectNameResult._ === "Error") {
      return;
    }
    setIsCreating(true);
    props.appState.createProgram(projectName);
  };
  return (
    <Box>
      <AppBar
        title="プログラム作成"
        account={props.account}
        appState={props.appState}
      />
      <Box padding={1}>
        <Box padding={1}>
          <TextField
            required
            fullWidth
            label="プログラム名"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
            }}
            error={!isFirst && projectNameResult._ === "Error"}
            helperText={
              !isFirst && projectNameResult._ === "Error"
                ? projectNameResult.error
                : undefined
            }
            variant="outlined"
            InputProps={{
              readOnly: isCreating,
            }}
          />
        </Box>
        <Box padding={1}>
          {isCreating ? (
            <Button
              fullWidth
              variant="contained"
              disabled
              className={classes.createButton}
              startIcon={<CircularProgress />}
            >
              「{projectNameResult._ === "Ok" ? projectNameResult.ok : "?????"}
              」を作成中……
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={createProgram}
              size="large"
              disabled={!isFirst && projectNameResult._ === "Error"}
              variant="contained"
              color="primary"
              className={classes.createButton}
              startIcon={<Add />}
            >
              {projectNameResult._ === "Ok"
                ? `「${projectNameResult.ok}」`
                : "プログラム"}
              を作成
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
