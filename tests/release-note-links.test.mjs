import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
function load(path, dependencies = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(read(path), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      assert.ok(Object.hasOwn(dependencies, name), name);
      return dependencies[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}

const activation = load("src/lib/social/link-out-activation.ts");
const opened = [];
const { RichNote } = load("src/components/update/rich-notes.tsx", {
  "react/jsx-runtime": jsxRuntime,
  "@/lib/social/link-out-activation": activation,
  "@/lib/window": { openUrl: (url) => opened.push(url) },
});
const notes = JSON.parse(read("src/lib/updater/bundled-release-notes.json")).notes;
const channel = "https://discord.com/channels/1528501875241123901/1545791737111253085";

test("beta notes render the exact report channel as a named, keyboard-focusable link", () => {
  const markup = renderToStaticMarkup(RichNote({ note: notes["0.9.126"] }));
  assert.ok(markup.includes(`href="${channel}"`));
  assert.match(markup, /<a [^>]*>Report a bug on Discord<\/a>/);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.match(markup, /focus-visible:outline-auto/);
  assert.doesNotMatch(markup, /tabindex="-1"|Provider credentials are no longer forwarded/);
});

test("historical plain notes stay plain and unsafe link schemes cannot render", () => {
  assert.doesNotMatch(renderToStaticMarkup(RichNote({ note: notes["0.9.125"] })), /<a /);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,example",
    "file:///example",
    "/relative",
  ]) {
    const markup = renderToStaticMarkup(
      RichNote({
        note: { sections: [{ items: ["<b>Plain text</b>"], links: [{ label: "Bad", url }] }] },
      }),
    );
    assert.doesNotMatch(markup, /<a |<b>/);
    assert.match(markup, /&lt;b&gt;Plain text&lt;\/b&gt;/);
  }
});

test("primary, keyboard and middle-click activation use the existing external opener", () => {
  const section = notes["0.9.126"].sections.find((item) => item.links);
  const tree = RichNote({ note: { sections: [section] } });
  const anchor = tree.props.children[2][0].props.children[2][0];
  for (const button of [undefined, 0, 1]) {
    let prevented = false;
    const event = {
      button,
      target: { closest: () => ({ getAttribute: () => channel }) },
      preventDefault: () => {
        prevented = true;
      },
    };
    (button === 1 ? anchor.props.onAuxClick : anchor.props.onClick)(event);
    assert.equal(prevented, true);
    assert.equal(opened.at(-1), channel);
  }
  assert.equal(opened.length, 3);
});
