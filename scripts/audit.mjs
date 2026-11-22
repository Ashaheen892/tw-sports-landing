import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Structural checks for this landing bundle. Run after `pnpm build`.
 * Counts are read from the bundle itself, so adding a section or a page does not break the audit.
 */
const root = fileURLToPath(new URL("..", import.meta.url));
const bundle = JSON.parse(fs.readFileSync(path.join(root, "twilight-bundle.json"), "utf8"));
const errors = [];
const REQUIRED = ["volt-stats", "proof-marks", "team-board", "lab-line"];
const BANNED = ["selia", "سيليا", "eslamoo", "نَسَق", "ساجي"];

if (!bundle.features?.includes("landing-page-templates")) errors.push("missing landing-page-templates");
if ((bundle.templates || []).length < 2) errors.push("Salla needs at least two templates");

const names = new Set(bundle.components.map((item) => item.name));
for (const name of names) {
  const source = path.join(root, "src", "components", name, "index.ts");
  if (!fs.existsSync(source)) { errors.push(`missing src for ${name}`); continue; }
  const code = fs.readFileSync(source, "utf8");
  if (!code.includes("localizedString(")) errors.push(`${name} never unwraps localizedString`);
  if (/\bnothing\b/.test(code.replace(/^import.*$/gm, "")) && !/import\s*\{[^}]*\bnothing\b[^}]*\}\s*from\s*"lit"/.test(code)) errors.push(`${name} uses nothing without importing it`);
  if (!fs.existsSync(path.join(root, "dist", `${name}.js`))) errors.push(`missing dist/${name}.js (run pnpm build)`);
}

for (const template of bundle.templates || []) {
  const file = template.path.replace("templates.", "");
  const page = JSON.parse(fs.readFileSync(path.join(root, "templates", `${file}.json`), "utf8"));
  const order = page.components.map((item) => item.name);
  if (order[0] !== "volt-bar") errors.push(`${file} should open with the page header`);
  if (order.at(-1) !== "volt-footer") errors.push(`${file} should end with the page footer`);
  for (const name of REQUIRED) if (!order.includes(name)) errors.push(`${file} is missing ${name}`);
  for (const name of order) if (!names.has(name)) errors.push(`${file} uses unknown section ${name}`);
}

// Every section injects its CSS globally, so two sections must not style the same top-level class.
const owners = new Map();
for (const name of names) {
  const source = path.join(root, "src", "components", name, "index.ts");
  if (!fs.existsSync(source)) continue;
  const css = (fs.readFileSync(source, "utf8").match(/const css = `([\s\S]*?)`;/) || [])[1] || "";
  const flat = css.replace(/\{[^{}]*\}/g, "{}").replace(/\{[^{}]*\}/g, "{}");
  for (const match of flat.matchAll(/(?:^|[\s,}])\.([\w-]+)/g)) {
    const cls = match[1];
    if (!owners.has(cls)) owners.set(cls, new Set());
    owners.get(cls).add(name);
  }
}
const SHARED_OK = [];
for (const [cls, set] of owners) {
  if (set.size > 1 && !SHARED_OK.includes(cls)) errors.push(`class .${cls} is styled by ${[...set].join(", ")}`);
}

const scan = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git", "public"].includes(entry.name) || entry.name === "audit.mjs") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (/\.(json|ts|mjs|md|py)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8").toLowerCase();
      for (const word of BANNED) if (text.includes(word.toLowerCase())) errors.push(`${path.relative(root, full)} mentions ${word}`);
    }
  }
};
scan(root);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`audit ok: ${names.size} sections, ${bundle.templates.length} templates`);
