import * as React from "react";
import * as d from "../../data";
import { Box, Button, TextField, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppBar } from "../ui";
import { stringToValidProjectName } from "../../common/validation";

const useStyles = makeStyles({
  createButton: {
    textTransform: "none",
  },
});

export const NewProject: React.VFC<{
  accountToken: d.AccountToken;
  account: d.QAccount;
}> = (props) => {
  const classes = useStyles();
  const [projectName, setProjectName] = React.useState<string>("");
  const [isFirst, setIsFirst] = React.useState<boolean>(true);

  const projectNameResult = stringToValidProjectName(projectName);
  return (
    <Box>
      <AppBar title="プロジェクト作成" account={props.account}></AppBar>
      <Box padding={1}>
        <Box padding={1}>
          <TextField
            required
            fullWidth
            label="プロジェクト名"
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
          />
        </Box>
        <Box padding={1}>
          <Button
            fullWidth
            onClick={() => {
              setIsFirst(false);
              console.log("作成ボタンを押された");
            }}
            size="large"
            disabled={!isFirst && projectNameResult._ === "Error"}
            variant="contained"
            color="primary"
            className={classes.createButton}
            startIcon={<Add />}
          >
            {projectNameResult._ === "Ok"
              ? `「${projectNameResult.ok}」`
              : "プロジェクト"}
            を作成
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
