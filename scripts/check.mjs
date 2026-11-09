import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const site = JSON.parse(await readFile(new URL("../data/site.json", import.meta.url), "utf8"));
assert.match(site.githubUsername, /^[a-z\d][a-z\d-]{0,38}$/i);
assert.ok(["zh", "en"].includes(site.defaultLanguage));
for (const key of ["education", "awards", "publications", "projects", "interests", "skills"])
  assert.ok(Array.isArray(site[key]), `${key} must be an array`);
for (const item of [site.profile.name, site.profile.role, ...site.about])
  assert.ok(item.zh && item.en, "Both language variants are required");
for (const asset of [site.profile.avatar, ...site.projects.map((p) => p.cover)])
  await access(new URL("../" + asset, import.meta.url));
for (const key of ["projects", "publications"])
  assert.equal(
    new Set(site[key].map((x) => x.id)).size,
    site[key].length,
    `${key} IDs must be unique`,
  );
const github = JSON.parse(await readFile(new URL("../data/github.json", import.meta.url), "utf8"));
assert.equal(
  github.username,
  site.githubUsername,
  "Snapshot must match the configured account; run sync after changing it",
);
for (const c of github.calendars) {
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
  "scripts/build.mjs",
  "scripts/serve.mjs",
  "scripts/sync-github.mjs",
]) {
  const r = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}
console.log(
  "Passed: bilingual content, assets, IDs, GitHub snapshot integrity, JavaScript syntax.",
);
