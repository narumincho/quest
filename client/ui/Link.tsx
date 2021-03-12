import * as React from "react";
import * as d from "../../data";
import { AppState } from "../state";
import { locationToPath } from "../../common/url";

export const Link: React.FC<{ appState: AppState; location: d.QLocation }> = (
  props
) => {
  return (
    <a
      href={locationToPath(props.location)}
      onClick={(mouseEvent) =>
        onClick(mouseEvent, () => props.appState.jump(props.location))
      }
    >
      {props.children}
    </a>
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
