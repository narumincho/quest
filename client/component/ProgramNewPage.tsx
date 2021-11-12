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
import { PageContainer } from "./PageContainer";
import { TextEditor } from "./TextEditor";
import { stringToValidProgramName } from "../../common/validation";

export const ProgramNewPage = (props: {
  readonly appState: AppState;
  readonly isDarkMode: boolean;
}): React.ReactElement => {
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
            <div></div>
          </Breadcrumbs>
        </Box>
        <Box padding={1}>
          <Typography variant="h5">プログラム作成</Typography>
        </Box>
        <Box padding={1}>
          <TextEditor
            label="プログラム名"
            value={projectName}
            onChangeOrReadonlyOrDisabled={
              isCreating ? "readonly" : setProjectName
            }
            error={!isFirst && projectNameResult._ === "Error"}
            helperText={
              !isFirst && projectNameResult._ === "Error"
                ? projectNameResult.errorValue
                : ""
            }
            data-cy="programNameInput"
            multiline={false}
            isDarkMode={props.isDarkMode}
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
            sx={{ textTransform: "none" }}
            startIcon={<Add />}
            data-cy="create"
          >
            {projectNameResult._ === "Ok"
              ? `「${projectNameResult.okValue}」`
              : "プログラム"}
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
