import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppBar } from "../ui";
import { AppState } from "../state";
import { stringToValidProjectName } from "../../common/validation";

export type Props = {
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
      <AppBar title="プログラム作成" appState={props.appState} />
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
            data-cy="programNameInput"
          />
        </Box>
        <Box padding={1}>
          <Button
            fullWidth
            onClick={createProgram}
            size="large"
            disabled={!isFirst && projectNameResult._ === "Error"}
            variant="contained"
            color="primary"
            className={classes.createButton}
            startIcon={<Add />}
            data-cy="create"
          >
            {projectNameResult._ === "Ok"
              ? `「${projectNameResult.ok}」`
              : "プログラム"}
            を作成
          </Button>
        </Box>
      </Box>
      <Dialog open={isCreating}>
        <DialogTitle>
          「{projectNameResult._ === "Ok" ? projectNameResult.ok : "?????"}
          」を作成中
        </DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </Box>
  );
};
