import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
async function versionedAsset(file) {
  if (!file || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(file)) return file;
  const [pathname] = file.split(/[?#]/);
  const bytes = await readFile(path.join(dist, pathname));
  const version = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  return `${pathname}?v=${version}`;
}
await mkdir(path.join(dist, "data"), { recursive: true });
for (const name of ["index.html", ".nojekyll", "assets", "src"])
  await cp(path.join(root, name), path.join(dist, name), { recursive: true });
for (const [file, global] of [
  ["site", "SITE_DATA"],
  ["github", "GITHUB_DATA"],
]) {
  const data = JSON.parse(await readFile(path.join(root, "data", `${file}.json`), "utf8"));
  if (file === "site") {
    data.profile.avatar = await versionedAsset(data.profile.avatar);
    for (const project of data.projects) project.cover = await versionedAsset(project.cover);
  }
  await writeFile(
    path.join(dist, "data", `${file}.js`),
    `window.${global} = ${JSON.stringify(data).replace(/</g, "\\u003c")};\n`,
  );
}
// Version the generated data as well as code: a fresh page must not reuse stale content.
let html = await readFile(path.join(root, "index.html"), "utf8");
for (const file of [
  "assets/favicon.svg",
  "src/styles.css",
  "data/site.js",
  "data/github.js",
  "src/app.js",
]) {
  html = html.replaceAll(`"${file}"`, `"${await versionedAsset(file)}"`);
}
await writeFile(path.join(dist, "index.html"), html);
console.log("Built dist/ — ready for GitHub Pages. No dependencies required.");
