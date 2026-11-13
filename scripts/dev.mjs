import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildSite } from "./build.mjs";
import { startServer } from "./serve.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
let timer,
  running = false,
  pending = false,
  stopped = false;
async function rebuild() {
  pending = true;
  if (running || stopped) return;
  running = true;
  while (pending && !stopped) {
    pending = false;
    try {
      await buildSite(root);
      console.log("配置已更新，浏览器会自动刷新。");
    } catch (error) {
      console.error(`构建失败，请修正后保存：${error.message}`);
    }
  }
  running = false;
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 180);
}
// Watch the parent directory so editor atomic saves do not detach the watcher.
const watchers = [
  watch(root, (_, filename) => {
    if (["config.jsonc", "index.html"].includes(String(filename))) schedule();
  }),
];
for (const folder of ["assets", "src", "data"])
  watchers.push(watch(path.join(root, folder), { recursive: true }, schedule));
for (const watcher of watchers) watcher.on("error", (error) => console.error(error.message));

await rebuild();
const server = startServer({ liveReload: true });
console.log("编辑 config.jsonc 并保存即可预览；线上更新需提交到 GitHub。Ctrl+C 停止。");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopped = true;
    clearTimeout(timer);
    watchers.forEach((watcher) => watcher.close());
    server.close();
    server.closeAllConnections();
  });
