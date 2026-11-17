import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const entryFile = path.join(__dirname, "app.ts");
const outFile = path.join(rootDir, "docs", "battleship", "app.js");
const checkOnly = process.argv.includes("--check");

function normalizeBundle(rawBody) {
  const umd = [
    "(function (root, factory) {",
    '  if (typeof module === "object" && module.exports) {',
    "    module.exports = factory();",
    "  } else {",
    "    root.BattleshipWeb = factory();",
    "  }",
    '})(typeof self !== "undefined" ? self : this, function () {',
    '  "use strict";',
    rawBody.trimEnd(),
    "  return __BattleshipBundle;",
    "});",
    ""
  ].join("\n");
  return umd
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}

async function main() {
  const res = await build({
    entryPoints: [entryFile],
    bundle: true,
    format: "iife",
    globalName: "__BattleshipBundle",
    target: "es2020",
    write: false,
    legalComments: "none"
  });
  const output = normalizeBundle(res.outputFiles[0].text);
  for (let i = 0; i < output.length; i++) {
    if (output.charCodeAt(i) > 127) {
      throw new Error("Non-ASCII character emitted in bundled output at index " + i);
    }
  }

  if (checkOnly) {
    const existing = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : "";
    if (existing !== output) {
      console.error("docs/battleship/app.js is out of sync with battleship/ts/*.ts");
      process.exit(1);
    }
    console.log("sync ok");
    return;
  }

  fs.writeFileSync(outFile, output, "utf8");
  console.log("built " + path.relative(rootDir, outFile) + " (" + output.length + " bytes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
