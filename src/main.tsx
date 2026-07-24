import { render } from "preact";

import { App } from "./app/App";
import "./ui/styles.css";

const mountPoint = document.getElementById("app");

if (mountPoint === null) {
  throw new Error("PhraseGarden mount point is missing.");
}

render(<App />, mountPoint);
