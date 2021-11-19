import * as React from "react";
import * as commonUrl from "../../common/url";
import * as d from "../../data";
import { Avatar } from "@mui/material";

/**
 * アカウントのアイコン画像
 */
export const AccountIcon = (props: {
  readonly name: string;
  readonly imageHashValue: d.ImageHashValue;
}): React.ReactElement => {
  return (
    <Avatar
      alt={props.name}
      src={commonUrl.imageUrl(props.imageHashValue).toString()}
    />
  );
};
