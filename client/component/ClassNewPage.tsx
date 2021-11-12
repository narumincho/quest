import * as React from "react";
import * as d from "../../data";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { AppState } from "../state";
import { Link } from "./Link";
import { LoggedInState } from "../state/loggedInState";
import { PageContainer } from "./PageContainer";
import { TextEditor } from "./TextEditor";
import { stringToValidClassName } from "../../common/validation";

export const ClassNewPage = (props: {
  readonly appState: AppState;
  readonly loggedInState: LoggedInState;
  readonly programId: d.ProgramId;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
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
    <PageContainer
      appState={props.appState}
      isDarkMode={props.isDarkMode}
      leftActionType="back"
    >
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
          <TextEditor
            label="クラス名"
            value={className}
            onChangeOrReadonlyOrDisabled={
              isCreating ? "readonly" : setClassName
            }
            error={!isFirst && projectNameResult._ === "Error"}
            helperText={
              !isFirst && projectNameResult._ === "Error"
                ? projectNameResult.errorValue
                : ""
            }
            data-cy="programNameInput"
            isDarkMode={props.isDarkMode}
            multiline={false}
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
            sx={{ textTransform: "none" }}
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
