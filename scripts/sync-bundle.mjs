import fs from "node:fs";

const text = fs.readFileSync(new URL("../twilight-bundle.json", import.meta.url), "utf8");
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
fs.mkdirSync(new URL("../dist/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../public/twilight-bundle.json", import.meta.url), text);
fs.writeFileSync(new URL("../dist/twilight-bundle.json", import.meta.url), text);
console.log("bundle synced");
