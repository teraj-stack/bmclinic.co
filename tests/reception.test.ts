import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/app/page";
test("reception has accessible clickable entrances for all four departments", () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.match(html, /aria-label="Wejścia do działów kliniki"/);
  for (const path of [
    "proktologia",
    "flebologia",
    "chirurgia-ogolna",
    "medycyna-estetyczna",
  ])
    assert.ok(html.includes(`href="/${path}"`));
});
