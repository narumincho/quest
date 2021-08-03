import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppState } from "../state";
import { Link } from "./Link";
import { PageContainer } from "./PageContainer";
import { stringToValidProgramName } from "../../common/validation";

export type Props = {
  readonly appState: AppState;
};

const useStyles = makeStyles({
  createButton: {
    textTransform: "none",
  },
});

export const ProgramNewPage: React.VFC<Props> = (props) => {
  const classes = useStyles();
  const [projectName, setProjectName] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const projectNameResult = stringToValidProgramName(projectName);

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
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.QLocation.Top}>
              トップページ
            </Link>
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">プログラム作成</Typography>
        </Box>
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
    </PageContainer>
  );
};
