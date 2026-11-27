import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, "../..");
const destination = path.join(root, "docs/pokemon_fight");
const check = process.argv.includes("--check");
const photos = ["IMG_0713.jpeg", "IMG_0714.jpeg", "IMG_0712.jpeg", "IMG_0718.jpeg", "IMG_0717.jpeg", "IMG_0719.jpeg", "IMG_0715.jpeg"];

const result = await build({
  entryPoints: [path.join(directory, "app.ts")], bundle: true, format: "iife", globalName: "__PocketArena",
  target: "es2020", charset: "ascii", write: false, legalComments: "none"
});
const bundle = '(function(root,factory){if(typeof module==="object"&&module.exports){module.exports=factory();}else{root.PocketArena=factory();}})(typeof self!=="undefined"?self:this,function(){\n' + result.outputFiles[0].text + '\nreturn __PocketArena;\n});\n';
const outputs = new Map([
  ["app.js", Buffer.from(bundle)],
  ["index.html", fs.readFileSync(path.join(directory, "../web/index.html"))],
  ["style.css", fs.readFileSync(path.join(directory, "../web/style.css"))],
  ...photos.map(name => ["assets/" + name, fs.readFileSync(path.join(directory, "../img", name))])
]);
for (const [name, content] of outputs) {
  const target = path.join(destination, name);
  if (check) {
    if (!fs.existsSync(target) || !fs.readFileSync(target).equals(content)) throw new Error("Generated file is out of sync: " + path.relative(root, target));
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}
console.log(check ? "Pokemon arena bundle, page, styles, and seven original photos are in sync." : "Built docs/pokemon_fight with seven original card photos.");
