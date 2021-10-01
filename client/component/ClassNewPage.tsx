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
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";
import { stringToValidClassName } from "../../common/validation";

const useStyles = makeStyles({
  createButton: {
    textTransform: "none",
  },
});

export const ClassNewPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly programId: d.ProgramId;
}): React.ReactElement => {
  const classes = useStyles();
  const [className, setClassName] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const program = props.loggedInState.createdProgramMap.get(props.programId);

  const projectNameResult = stringToValidClassName(className);

  const createClass = () => {
    setIsFirst(false);
    if (isCreating) {
      return;
    }
    if (projectNameResult._ === "Error") {
      return;
    }
    setIsCreating(true);
    props.appState.createClass({ className, programId: props.programId });
  };
  return (
    <PageContainer appState={props.appState}>
      <Box padding={1}>
        <Box padding={1}>
          <Breadcrumbs>
            <Link appState={props.appState} location={d.Location.Top}>
              トップページ
            </Link>
            <Link
              appState={props.appState}
              location={d.Location.Program(props.programId)}
            >
              {program === undefined ? "プログラム" : program.name}
            </Link>
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">クラス作成</Typography>
        </Box>
        <Box padding={1}>
          <TextField
            required
            fullWidth
            label="クラス名"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
            }}
            error={!isFirst && projectNameResult._ === "Error"}
            helperText={
              !isFirst && projectNameResult._ === "Error"
                ? projectNameResult.errorValue
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
            onClick={createClass}
            size="large"
            disabled={!isFirst && projectNameResult._ === "Error"}
            variant="contained"
            color="primary"
            className={classes.createButton}
            startIcon={<Add />}
            data-cy="create"
          >
            {projectNameResult._ === "Ok"
              ? `「${projectNameResult.okValue}」`
              : "クラス"}
            を作成
          </Button>
        </Box>
      </Box>
      <Dialog open={isCreating}>
        <DialogTitle>
          「{projectNameResult._ === "Ok" ? projectNameResult.okValue : "?????"}
          」を作成中
        </DialogTitle>
        <Box padding={2} display="grid" justifyContent="center">
          <CircularProgress />
        </Box>
      </Dialog>
    </PageContainer>
  );
};
