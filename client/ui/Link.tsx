import * as React from "react";
import * as d from "../../data";
import { locationToPath } from "../../common/url";
import { useAppState } from "../state";

export const Link: React.FC<{ location: d.QLocation }> = (props) => {
  const { jump } = useAppState();
  return (
    <a
      href={locationToPath(props.location)}
      onClick={(mouseEvent) => onClick(mouseEvent, () => jump(props.location))}
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
