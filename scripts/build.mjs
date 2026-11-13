import { mkdir, readFile, writeFile, cp, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadSiteConfig, loadGitHubSnapshot, localize } from "./config.mjs";

export async function buildSite(root = fileURLToPath(new URL("../", import.meta.url))) {
  const site = await loadSiteConfig(path.join(root, "config.jsonc"));
  const github = await loadGitHubSnapshot(site, path.join(root, "data/github.json"));
  const dist = path.join(root, "dist");
  async function versionedAsset(file) {
    if (!file || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(file)) return file;
    const [pathname] = file.split(/[?#]/);
    const bytes = await readFile(path.join(dist, pathname));
    const version = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    return `${pathname}?v=${version}`;
  }
  await mkdir(path.join(dist, "data"), { recursive: true });
  for (const name of [".nojekyll", "assets", "src"])
    await cp(path.join(root, name), path.join(dist, name), { recursive: true });
  for (const [file, global] of [
    ["site", "SITE_DATA"],
    ["github", "GITHUB_DATA"],
  ]) {
    const data = file === "site" ? site : github;
    if (file === "site") {
      data.profile.avatar = await versionedAsset(data.profile.avatar);
      for (const project of data.projects) project.cover = await versionedAsset(project.cover);
      for (const entry of data.education) {
        if (entry.logo) entry.logo = await versionedAsset(entry.logo);
      }
      data.favicon = await versionedAsset(data.favicon);
    }
    await writeFile(
      path.join(dist, "data", `${file}.js`),
      `window.${global} = ${JSON.stringify(data).replace(/</g, "\\u003c")};\n`,
    );
  }
  // Version the generated data as well as code: a fresh page must not reuse stale content.
  let html = await readFile(path.join(root, "index.html"), "utf8");
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const metadata = {
    LANGUAGE: site.defaultLanguage === "zh" ? "zh-CN" : "en",
    TITLE: localize(site.title, site.defaultLanguage),
    DESCRIPTION: localize(site.description, site.defaultLanguage),
    FAVICON: site.favicon,
  };
  html = html.replace(/\{\{(LANGUAGE|TITLE|DESCRIPTION|FAVICON)\}\}/g, (_, key) =>
    escapeHtml(metadata[key]),
  );
  for (const file of ["src/styles.css", "data/site.js", "data/github.js", "src/app.js"]) {
    html = html.replaceAll(`"${file}"`, `"${await versionedAsset(file)}"`);
  }
  // Publish the entry point last so live reload never sees a partial template.
  await writeFile(path.join(dist, "index.html.tmp"), html);
  await rename(path.join(dist, "index.html.tmp"), path.join(dist, "index.html"));
  console.log("Built dist/ — ready for GitHub Pages. No dependencies required.");
  return { site, github, html };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
}
