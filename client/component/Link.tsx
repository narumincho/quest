import * as React from "react";
import * as d from "../../data";
import { AppState } from "../state";
import { Link as MuiLink } from "@mui/material";
import { locationToUrl } from "../../common/url";

export const Link: React.FC<{
  readonly appState: AppState;
  readonly location: d.Location;
  readonly onClick?: (() => void) | undefined;
}> = (props) => {
  return (
    <MuiLink
      sx={{
        color: (theme) => {
          return theme.palette.mode === "dark" ? "#99e1ff" : undefined;
        },
      }}
      href={locationToUrl(props.location).toString()}
      onClick={(
        mouseEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ): void => {
        if (props.onClick !== undefined) {
          props.onClick();
        }
        onClick(mouseEvent, () => props.appState.jump(props.location));
      }}
      underline="hover"
    >
      {props.children}
    </MuiLink>
  );
};

const onClick = (
  mouseEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  handler: () => void
): void => {
  /*
   * リンクを
   * Ctrlなどを押しながらクリックか,
   * マウスの中ボタンでクリックした場合などは, ブラウザで新しいタブが開くので, ブラウザでページ推移をしない.
   */
  if (
    mouseEvent.ctrlKey ||
    mouseEvent.metaKey ||
    mouseEvent.shiftKey ||
    mouseEvent.button !== 0
  ) {
    return;
  }
  mouseEvent.preventDefault();
  handler();
};
