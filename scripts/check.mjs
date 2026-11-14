import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadSiteConfig, loadGitHubSnapshot } from "./config.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const site = await loadSiteConfig();
assert.match(site.githubUsername, /^[a-z\d][a-z\d-]{0,38}$/i);
assert.ok(["zh", "en"].includes(site.defaultLanguage));
for (const key of ["education", "awards", "publications", "projects", "interests", "skills"])
  assert.ok(Array.isArray(site[key]), `${key} must be an array`);
for (const item of [site.profile.name, site.profile.role, ...site.about])
  assert.ok(item.zh && item.en, "Both language variants are required");
for (const asset of [
  site.profile.avatar,
  site.favicon,
  ...site.projects.map((p) => p.cover),
  ...site.education.map((entry) => entry.logo).filter(Boolean),
])
  await access(new URL("../" + asset, import.meta.url));
for (const key of ["projects", "publications"])
  assert.equal(
    new Set(site[key].map((x) => x.id)).size,
    site[key].length,
    `${key} IDs must be unique`,
  );
for (const project of site.projects)
  assert.ok(
    typeof project.id === "string" && project.id.trim(),
    "Each project needs an ID for its detail-page link",
  );
const github = await loadGitHubSnapshot(site);
assert.equal(
  github.username.toLowerCase(),
  site.githubUsername.toLowerCase(),
  "Snapshot must match the configured account",
);
for (const c of github.calendars) {
  const days = c.weeks.flatMap((week) => week.days);
  assert.equal(
    new Set(days.map((day) => day.date)).size,
    days.length,
    "Calendar dates must be unique",
  );
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    c.total,
    "Calendar total must match the daily contributions",
  );
  for (const w of c.weeks) {
    assert.ok(w.days.length <= 7);
    for (const d of w.days) {
      assert.ok(d.count >= 0 && d.weekday >= 0 && d.weekday <= 6 && d.level >= 0 && d.level <= 4);
    }
  }
}
for (const p of github.mergedPRs) {
  assert.ok(p.mergedAt);
  assert.ok(p.url.startsWith("https://github.com/"));
  assert.notEqual(p.repository.split("/")[0].toLowerCase(), site.githubUsername.toLowerCase());
}
for (const file of [
  "src/app.js",
  "src/project.js",
  "scripts/build.mjs",
  "scripts/serve.mjs",
  "scripts/sync-github.mjs",
  "scripts/config.mjs",
  "scripts/dev.mjs",
]) {
  const r = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}
console.log(
  "Passed: bilingual content, assets, IDs, GitHub snapshot integrity, JavaScript syntax.",
);
