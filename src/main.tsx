import * as React from "react";
import * as ReactDom from "react-dom";

window.addEventListener("load", () => {
  const entryElement = document.createElement("div");
  document.body.appendChild(entryElement);
  ReactDom.render(
    <React.StrictMode>
      <div>それな</div>
    </React.StrictMode>,
    entryElement
  );
});
