import * as React from "react";
import * as ReactDom from "react-dom";
import { ThemedApp } from "./ThemedApp";

window.addEventListener("load", () => {
  const entryElement = document.createElement("div");
  document.body.appendChild(entryElement);
  document.body.style.margin = "0";

  ReactDom.render(
    <React.StrictMode>
      <ThemedApp />
    </React.StrictMode>,
    entryElement
  );
});
