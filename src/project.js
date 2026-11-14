/* A standalone project page; all content is maintained in config.jsonc. */
(() => {
  "use strict";
  const data = window.SITE_DATA;
  const id = new URLSearchParams(location.search).get("id");
  const project = data?.projects.find((x) => x.id === id);
  let lang = data?.defaultLanguage || "zh";
  try {
    const saved = localStorage.getItem("academic-language");
    if (["zh", "en"].includes(saved)) lang = saved;
  } catch {}
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const l = (value) =>
    typeof value === "object" && value !== null
      ? (value[lang] ?? value.zh ?? value.en ?? "")
      : (value ?? "");
  const w = (zh, en) => (lang === "zh" ? zh : en);
  const url = (value) => {
    if (!value || typeof value !== "string") return "";
    try {
      const result = new URL(value, location.href);
      return ["https:", "http:"].includes(result.protocol) ? result.href : "";
    } catch {
      return "";
    }
  };
  const anchor = (href, label) =>
    url(href)
      ? `<a href="${esc(url(href))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`
      : "";
  const image = (src, alt, cls = "") =>
    url(src) ? `<img class="${cls}" src="${esc(url(src))}" alt="${esc(alt)}" loading="lazy">` : "";
  const paragraph = (text) => (l(text) ? `<p>${esc(l(text))}</p>` : "");
  const empty = () => `<p class="empty">${w("内容待补充。", "Content coming soon.")}</p>`;
  const section = (id, title, body) =>
    `<section id="${id}" class="detail-section"><h2>${esc(title)}</h2>${body || empty()}</section>`;
  function visual(block = {}) {
    return image(block.image, l(block.description)) + paragraph(block.description);
  }
  function render() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.getElementById("project-nav").innerHTML =
      `<a href="./#projects">← ${w("返回主页", "Back to homepage")}</a><div class="nav-actions">${project ? anchor(project.repository, "GitHub") : ""}<div class="language-switch" role="group" aria-label="Language">${["zh", "en"].map((code) => `<button data-language="${code}" aria-pressed="${lang === code}">${code === "zh" ? "中文" : "EN"}</button>`).join("")}</div></div>`;
    if (!project) {
      document.title = w("项目未找到", "Project not found");
      document.querySelector('meta[name="description"]').content = document.title;
      document.getElementById("project-content").innerHTML =
        `<section class="not-found"><h1>${document.title}</h1><p>${w("此项目链接不存在或已变更，请返回主页选择项目。", "This project link is missing or has changed. Please choose a project from the homepage.")}</p><a href="./#projects">${w("查看核心项目", "View projects")} →</a></section>`;
      return;
    }
    const page = project.detailPage || {};
    document.title = `${l(project.title)} · ${l(data.profile.name)}`;
    document.querySelector('meta[name="description"]').content = l(project.description);
    const videos = (page.videos || [])
      .map((video) => {
        const source = url(video.url);
        if (!source) return "";
        return `<article class="media-entry"><h3>${esc(l(video.title) || w("功能演示", "Demo"))}</h3>${video.type === "file" ? `<video controls playsinline preload="metadata"${url(video.poster) ? ` poster="${esc(url(video.poster))}"` : ""} src="${esc(source)}">${w("浏览器不支持视频播放。", "Your browser does not support video playback.")}</video><p>${anchor(source, w("打开视频文件", "Open video file"))}</p>` : `<p>${anchor(source, w("观看演示视频", "Watch demonstration"))}</p>`}${paragraph(video.description)}</article>`;
      })
      .join("");
    const achievements = (page.achievements || [])
      .map(
        (item) =>
          `<article class="achievement"><h3>${esc(l(item.title))}</h3>${paragraph(item.description)}${image(item.image, l(item.title))}${anchor(item.url, w("查看相关资料", "Related material"))}</article>`,
      )
      .join("");
    document.getElementById("project-content").innerHTML =
      `<header class="project-hero"><div><p class="eyebrow">${w("项目介绍", "PROJECT OVERVIEW")}</p><h1>${esc(l(project.title))}</h1>${paragraph(project.description)}<div class="tags">${(project.tags || []).map((tag) => `<span>${esc(l(tag))}</span>`).join("")}</div></div>${image(project.cover, l(project.title), "hero-cover")}</header><nav class="section-nav" aria-label="${w("项目章节", "Project sections")}">${[
        ["overview", w("项目概览", "Overview")],
        ["workflow", w("技术流程", "Workflow")],
        ["hardware", w("硬件结构", "Hardware")],
        ["videos", w("演示视频", "Videos")],
        ["achievements", w("项目成果", "Achievements")],
      ]
        .map(([id, title]) => `<a href="#${id}">${title}</a>`)
        .join(
          "",
        )}</nav>${section("overview", w("项目概览", "Overview"), paragraph(project.details || project.description) + (l(project.outcome) ? `<p><strong>${w("已有成果", "Current outcomes")}：</strong>${esc(l(project.outcome))}</p>` : ""))}${section("workflow", w("技术流程图", "Technical Workflow"), visual(page.workflow))}${section("hardware", w("硬件结构", "Hardware Architecture"), visual(page.hardware))}${section("videos", w("功能演示视频", "Demonstration Videos"), videos)}${section("achievements", w("项目成果与荣誉", "Achievements & Honors"), achievements)}<footer><a href="./#projects">← ${w("返回主页", "Back to homepage")}</a></footer>`;
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-language]");
    if (!button) return;
    lang = button.dataset.language;
    try {
      localStorage.setItem("academic-language", lang);
    } catch {}
    render();
  });
  render();
})();
