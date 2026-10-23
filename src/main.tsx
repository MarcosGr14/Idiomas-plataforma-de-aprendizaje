import { captureEnabled } from "./lib/capture";
import { HashRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import { brandCSS } from "./components/brand/BrandStyles";

import App from "./App";
import "./styles.css";
const brandStyle = document.createElement("style");
brandStyle.textContent = brandCSS();
document.head.append(brandStyle);
async function startApp() {
  if (captureEnabled) {
    await document.fonts.load(
      '30px "Noto Serif JP"',
      "日本語中文本屋花茶学福ラーメンあいうえお",
    );
    await document.fonts.ready;
  }
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>,
  );
}
void startApp();
