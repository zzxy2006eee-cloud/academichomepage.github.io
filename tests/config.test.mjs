import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { parseJSONC, loadSiteConfig, normalizeConfig, loadGitHubSnapshot } from "../scripts/config.mjs";
import { buildSite } from "../scripts/build.mjs";
import { startServer } from "../scripts/serve.mjs";

const sourceRoot = fileURLToPath(new URL("../", import.meta.url));
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "homepage-config-"));
  t.after(async () => {
    // Only delete the isolated directory created by this test.
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith("homepage-config-"));
    await rm(root, { recursive: true, force: true, maxRetries: 3 });
  });
  for (const name of ["config.jsonc", "index.html", ".nojekyll", "assets", "src", "scripts", "data", "package.json"])
    await cp(path.join(sourceRoot, name), path.join(root, name), { recursive: true });
  return root;
}
async function waitFor(check, label) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${label}`);
}

test("JSONC preserves URLs, comment-like strings and escaped quotes; errors are actionable", () => {
  const text = '\uFEFF{\n// 中文说明\n"url":"https://github.com/a/b", /* block */\n"text":"literal // and /* and \\\"quoted\\\"", "items":[1,2,],}';
  assert.deepEqual(parseJSONC(text), {
    url: "https://github.com/a/b", text: 'literal // and /* and "quoted"', items: [1, 2],
  });
  assert.throws(() => parseJSONC('{"x": /* missing'), /缺少 \*\//);
  assert.throws(() => parseJSONC('{"x": "unterminated}'), /配置格式有误/);
  assert.throws(() => parseJSONC('{"x":1 "y":2}'), /config\.jsonc/);
});

test("config changes reach HTML, runtime data, source links, images and safe account fallback", async (t) => {
  const root = await fixture(t);
  const filename = path.join(root, "config.jsonc");
  const config = await loadSiteConfig(filename);
  const first = await buildSite(root);
  const oldDataVersion = first.html.match(/data\/site\.js\?v=([a-f\d]+)/)[1];
  config.title = { zh: '新标题 <研究> & "展示"', en: "Research profile" };
  config.description = { zh: '新描述 </script> "quoted" & 中文', en: "Updated research description" };
  config.defaultLanguage = "en";
  config.repository = "https://github.com/example/new-homepage.git";
  config.githubUsername = "config-test-user";
  config.profile.email = "updated@example.com";
  await writeFile(path.join(root, "assets/test-icon.svg"), '<svg xmlns="http://www.w3.org/2000/svg"><title>Test</title></svg>');
  config.favicon = "assets/test-icon.svg";
  config.education = [{ logo: "assets/test-icon.svg" }];
  config.projects = [{ cover: "assets/test-icon.svg", description: { zh: "修改后的项目简介", en: "Updated project" } }];
  await writeFile(path.join(root, "data/github.json"), JSON.stringify({ username: "previous-test-user", status: "ready", calendars: [{ total: 999 }], mergedPRs: [{ title: "Old user" }] }));
  await writeFile(filename, "// updated settings\n" + JSON.stringify(config));
  const result = await buildSite(root);
  assert.match(result.html, /<html lang="en">/);
  assert.match(result.html, /<title>Research profile<\/title>/);
  assert.match(result.html, /content="Updated research description"/);
  assert.equal(result.site.repository, "example/new-homepage");
  assert.equal(result.site.profile.email, "updated@example.com");
  assert.equal(result.site.projects[0].description.zh, "修改后的项目简介");
  assert.equal(result.github.username, "config-test-user");
  assert.equal(result.github.status, "pending");
  assert.deepEqual(result.github.calendars, []);
  assert.deepEqual(result.github.mergedPRs, []);
  assert.notEqual(result.html.match(/data\/site\.js\?v=([a-f\d]+)/)[1], oldDataVersion);
  assert.match(result.site.education[0].logo, /\?v=[a-f\d]+$/);
  const generated = await readFile(path.join(root, "dist/data/site.js"), "utf8");
  assert.ok(!generated.includes("</script>"));
  config.defaultLanguage = "zh";
  await writeFile(filename, JSON.stringify(config));
  const chinese = await buildSite(root);
  assert.match(chinese.html, /新标题 &lt;研究&gt; &amp; &quot;展示&quot;/);
  assert.match(chinese.html, /&lt;\/script&gt; &quot;quoted&quot; &amp; 中文/);
  assert.doesNotMatch(chinese.html, /__dev\/version/);
  await writeFile(path.join(root, "assets/test-icon.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  const changedIcon = await buildSite(root);
  assert.notEqual(changedIcon.site.favicon, chinese.site.favicon);
  assert.throws(() => normalizeConfig({ ...config, repository: "https://evil.test/a/b" }), /repository/);
  assert.throws(() => normalizeConfig({ ...config, defaultLanguage: "fr" }), /defaultLanguage/);
  assert.throws(() => normalizeConfig({ ...config, title: { zh: "only" } }), /title/);
  const matching = { username: "CONFIG-TEST-USER", status: "ready", calendars: [], mergedPRs: [] };
  await writeFile(path.join(root, "data/github.json"), JSON.stringify(matching));
  assert.deepEqual(await loadGitHubSnapshot(config, path.join(root, "data/github.json")), matching);
  const staticServer = startServer({ directory: path.join(root, "dist"), port: 0 });
  await once(staticServer, "listening");
  try {
    const url = `http://127.0.0.1:${staticServer.address().port}`;
    assert.equal((await fetch(url + "/__dev/version")).status, 404);
    assert.doesNotMatch(await (await fetch(url)).text(), /__dev\/version/);
  } finally {
    staticServer.closeAllConnections();
    await new Promise((resolve) => staticServer.close(resolve));
  }
});

test("dev watches atomic config saves, retains the last page on invalid JSON, and recovers", async (t) => {
  const root = await fixture(t);
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const child = spawn(process.execPath, [path.join(root, "scripts/dev.mjs")], {
    cwd: root, env: { ...process.env, PORT: String(port) }, windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  try {
    const url = `http://127.0.0.1:${port}`;
    await waitFor(() => fetch(url).then((r) => r.ok), "dev server startup");
    const initialVersion = await (await fetch(url + "/__dev/version")).text();
    assert.match(await (await fetch(url)).text(), /location\.reload\(\)/);
    const filename = path.join(root, "config.jsonc");
    const config = await loadSiteConfig(filename);
    config.title = "Saved title";
    // Emulate an editor that replaces the file instead of modifying its inode.
    const { rename } = await import("node:fs/promises");
    await writeFile(filename + ".tmp", JSON.stringify(config));
    await rename(filename + ".tmp", filename);
    await waitFor(async () => (await (await fetch(url)).text()).includes("<title>Saved title</title>"), "saved configuration rebuild");
    assert.notEqual(await (await fetch(url + "/__dev/version")).text(), initialVersion);
    await writeFile(filename, '{"title":');
    await waitFor(() => output.includes("构建失败"), "configuration error reporting");
    assert.match(await (await fetch(url)).text(), /<title>Saved title<\/title>/);
    config.title = "Recovered title";
    await writeFile(filename, JSON.stringify(config));
    await waitFor(async () => (await (await fetch(url)).text()).includes("<title>Recovered title</title>"), "recovery after correcting configuration");
  } finally {
    if (child.exitCode === null) { child.kill(); await once(child, "exit"); }
  }
});
