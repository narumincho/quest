import * as React from "react";
import * as d from "../../data";
import {
  Link as MuiLink,
  StyleRules,
  Theme,
  makeStyles,
} from "@material-ui/core";
import { AppState } from "../state";
import { locationToUrl } from "../../common/url";

const useStyles = makeStyles((theme): StyleRules<"link"> => {
  if (theme.palette.type === "dark") {
    return {
      link: {
        color: "#99e1ff",
      },
    };
  }

  return {
    link: {},
  };
});

export const Link: React.FC<{ appState: AppState; location: d.QLocation }> = (
  props
) => {
  const classes = useStyles();
  return (
    <MuiLink
      href={locationToUrl(props.location).toString()}
      onClick={(mouseEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
        onClick(mouseEvent, () => props.appState.jump(props.location))
      }
      className={classes.link}
    >
      {props.children}
    </MuiLink>
  );
};

const onClick = (
  mouseEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  handler: () => void
) => {
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
