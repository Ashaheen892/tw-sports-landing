import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const bundle = JSON.parse(fs.readFileSync(new URL("../twilight-bundle.json", import.meta.url), "utf8"));
const errors = [];
const names = bundle.components.map((item) => item.name);
if (!bundle.features?.includes("landing-page-templates")) errors.push("missing landing-page-templates");
if (names.length !== 12) errors.push(`expected 12 sections, found ${names.length}`);
for (const template of bundle.templates || []) {
  const file = template.path.replace("templates.", "");
  const page = JSON.parse(fs.readFileSync(new URL(`../templates/${file}.json`, import.meta.url), "utf8"));
  const expected = { quwa: 12, khutta: 6 };
  if (page.components.length !== expected[file]) errors.push(`${file} should have ${expected[file]} sections`);
  if (page.components[0]?.name !== "page-bar") errors.push(`${file} should open with the page header`);
  if (page.components.at(-1)?.name !== "page-footer") errors.push(`${file} should end with the page footer`);
  for (const component of page.components) {
    const dist = path.join(root, "dist", `${component.name}.js`);
    if (!fs.existsSync(dist)) errors.push(`missing dist/${component.name}.js`);
    const source = fs.readFileSync(path.join(root, "src", "components", component.name, "index.ts"), "utf8");
    if (source.includes("this.label(")) errors.push(`${component.name} uses this.label`);
    if (!source.includes("localizedString(")) errors.push(`${component.name} never unwraps localizedString`);
  }
}
if (new Set(bundle.templates.map((item) => item.path)).size !== 2) errors.push("expected two templates");
const banned = ["selia", "سيليا", "eslamoo", "نَسَق", "ساجي"];
const scan = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name) || entry.name === "audit.mjs") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (/\.(json|ts|mjs|md|py)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8").toLowerCase();
      for (const word of banned) if (text.includes(word.toLowerCase())) errors.push(`${full} mentions ${word}`);
    }
  }
};
scan(root);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("audit ok");
