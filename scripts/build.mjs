import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
await mkdir(path.join(dist, "data"), { recursive: true });
for (const name of ["index.html", ".nojekyll", "assets", "src"])
  await cp(path.join(root, name), path.join(dist, name), { recursive: true });
for (const [file, global] of [
  ["site", "SITE_DATA"],
  ["github", "GITHUB_DATA"],
]) {
  const data = JSON.parse(await readFile(path.join(root, "data", `${file}.json`), "utf8"));
  await writeFile(
    path.join(dist, "data", `${file}.js`),
    `window.${global} = ${JSON.stringify(data).replace(/</g, "\\u003c")};\n`,
  );
}
console.log("Built dist/ — ready for GitHub Pages. No dependencies required.");
