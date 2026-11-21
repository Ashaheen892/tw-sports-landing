//@ts-nocheck
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { defineConfig, transformWithEsbuild } from "vite";
import {
  sallaBuildPlugin,
  sallaDemoPlugin,
  sallaTransformPlugin,
} from "@salla.sa/twilight-bundles/vite-plugins";

/** Each landing section is published as its own file, so shared helpers are copied per entry. */
function inlineUtils() {
  const PREFIX = "\0inline-util:";
  const fileOf = (id) => decodeURIComponent(id.slice(PREFIX.length).split("\0")[0]);
  const entryOf = (id) => id.split("\0").pop();
  return {
    name: "inline-utils",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!importer || !source.startsWith(".") || source.startsWith("\0")) return null;
      const entry = entryOf(importer);
      const base = importer.startsWith(PREFIX) ? fileOf(importer) : importer;
      if (!importer.startsWith(PREFIX) && !source.includes("/utils/")) return null;
      const file = resolve(dirname(base), source.replace(/\.js$/, ".ts"));
      if (!file.includes("/utils/")) return null;
      return `${PREFIX}${encodeURIComponent(file)}\0${entry}`;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const file = fileOf(id);
      this.addWatchFile(file);
      const code = readFileSync(file, "utf8");
      const result = await transformWithEsbuild(code, file, { loader: "ts" });
      return result.code;
    },
  };
}

export default defineConfig({
  esbuild: { keepNames: true, minifyIdentifiers: false },
  plugins: [
    inlineUtils(),
    sallaTransformPlugin(),
    sallaBuildPlugin(),
    sallaDemoPlugin({
      grid: { columns: "minmax(0, 1fr)", gap: "0" },
    }),
  ],
});
