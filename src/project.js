/* One continuous portfolio, with stable project and chapter anchors. */
(() => {
  "use strict";
  const data = window.SITE_DATA;
  const projects = data?.projects || [];
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  let lang = data?.defaultLanguage || "zh";
  try {
    const saved = localStorage.getItem("academic-language");
    if (["zh", "en"].includes(saved)) lang = saved;
  } catch {}
  const l = (value) =>
    typeof value === "object" && value !== null
      ? (value[lang] ?? value.zh ?? value.en ?? "")
      : (value ?? "");
  const w = (zh, en) => (lang === "zh" ? zh : en);
  const url = (value) => {
    if (!value || typeof value !== "string") return "";
    try {
      const u = new URL(value, location.href);
      return ["https:", "http:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  const href = (id) => `#${encodeURIComponent(id)}`;
  const number = (index) => String(index + 1).padStart(2, "0");
  const titleParts = (project) => {
    const full = String(l(project.title));
    const match = full.match(/^(.+?)[（(](.+)[）)]$/);
    return match ? [match[1].trim(), match[2]] : [full, ""];
  };
  const link = (address, text, cls = "") =>
    url(address)
      ? `<a class="${cls}" href="${esc(url(address))}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`
      : "";
  const paragraph = (text) => (l(text) ? `<p>${esc(l(text))}</p>` : "");
  const blocks = () => [
    ["overview", w("项目概览", "Overview")],
    ["workflow", w("技术流程", "Workflow")],
    ["hardware", w("硬件结构", "Hardware")],
    ["videos", w("功能演示", "Videos")],
    ["achievements", w("成果与荣誉", "Achievements")],
  ];
  const blockId = (project, key) => `${project.id}--${key}`;
  function visual(src, caption, ratio = "3 / 2") {
    if (!url(src)) return "";
    return `<figure><a class="figure-frame" style="aspect-ratio:${ratio}" href="${esc(url(src))}" data-enlarge aria-label="${w("放大查看图片", "Enlarge image")}"><img src="${esc(url(src))}" alt="${esc(l(caption))}" loading="lazy" decoding="async" width="1500" height="1000"><span class="enlarge-hint">↗ ${w("点击放大", "Enlarge")}</span></a>${l(caption) ? `<figcaption>${esc(l(caption))}</figcaption>` : ""}</figure>`;
  }
  function projectBlock(project, key, content) {
    const title = blocks().find((b) => b[0] === key)[1];
    return `<section class="detail-section${content ? "" : " pending-section"}" id="${esc(blockId(project, key))}" tabindex="-1"><h3>${title}</h3>${content || `<p class="empty">${w("内容待补充", "Content coming soon")}</p>`}</section>`;
  }
  function chapter(project, index) {
    const page = project.detailPage || {};
    const [title, subtitle] = titleParts(project);
    const videos = (page.videos || [])
      .map((video) => {
        if (!url(video.url)) return "";
        return `<article class="media-entry"><h4>${esc(l(video.title) || w("功能演示", "Demonstration"))}</h4>${video.type === "file" ? `<video controls playsinline preload="none" data-video-src="${esc(url(video.url))}"${url(video.poster) ? ` poster="${esc(url(video.poster))}"` : ""}></video><p>${link(video.url, w("打开视频文件", "Open video file"))}</p>` : `<p>${link(video.url, w("观看演示视频", "Watch demonstration"), "external-video")}</p>`}${paragraph(video.description)}</article>`;
      })
      .join("");
    const achievements = (page.achievements || [])
      .map(
        (item) =>
          `<article class="achievement"><h4>${esc(l(item.title))}</h4>${paragraph(item.description)}${visual(item.image, item.title, "16 / 10")}${link(item.url, w("相关资料", "Related material"))}</article>`,
      )
      .join("");
    const next = projects[index + 1];
    return `<article class="project-chapter" id="${esc(project.id)}" tabindex="-1"><header class="chapter-heading"><p class="eyebrow"><span>${number(index)}</span> / ${w("核心项目", "SELECTED PROJECT")}</p><div class="project-hero"><div><h2>${esc(title)}</h2>${subtitle ? `<p class="project-subtitle">${esc(subtitle)}</p>` : ""}${paragraph(project.description)}<div class="tags">${(project.tags || []).map((tag) => `<span>${esc(l(tag))}</span>`).join("")}</div><div class="project-actions">${link(project.repository, "GitHub", "repo-link")}${link(project.demo, w("在线演示", "Live demo"))}</div></div><div class="hero-visual"><img class="hero-cover" src="${esc(url(project.cover))}" alt="${esc(l(project.title))}" width="600" height="400" loading="${index ? "lazy" : "eager"}"></div></div></header><nav class="section-nav" aria-label="${esc(title)} ${w("章节", "sections")}">${blocks()
      .map(([key, text]) => `<a data-jump href="${href(blockId(project, key))}">${text}</a>`)
      .join(
        "",
      )}</nav>${projectBlock(project, "overview", paragraph(project.details || project.description) + (l(project.outcome) ? `<div class="outcome"><span>${w("项目成果", "OUTCOME")}</span>${paragraph(project.outcome)}</div>` : ""))}${projectBlock(project, "workflow", visual(page.workflow?.image, page.workflow?.description) + (page.workflow?.image ? "" : paragraph(page.workflow?.description)))}${projectBlock(project, "hardware", visual(page.hardware?.image, page.hardware?.description, "4 / 3") + (page.hardware?.image ? "" : paragraph(page.hardware?.description)))}${projectBlock(project, "videos", videos)}${projectBlock(project, "achievements", achievements)}<div class="chapter-end">${next ? `<a data-jump href="${href(next.id)}"><small>${w("继续浏览", "NEXT PROJECT")}</small><span>${esc(titleParts(next)[0])} →</span></a>` : `<a href="./#projects">← ${w("返回主页", "Back to homepage")}</a>`}</div></article>`;
  }
  let activeId = "",
    scrollLock = "",
    unlockTimer,
    frame = 0,
    mediaObserver;
  const dialog = document.getElementById("image-viewer");
  function readHash() {
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch {
      return "";
    }
  }
  function ownerOf(id) {
    return projects.find((p) => p.id === id || blocks().some(([key]) => blockId(p, key) === id));
  }
  function activate(id, syncUrl = false) {
    if (!id) return;
    const changed = activeId !== id;
    activeId = id;
    document.querySelectorAll("[data-project-link]").forEach((a) => {
      const selected = a.dataset.projectLink === id;
      if (selected) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    if (syncUrl && changed && ownerOf(readHash())?.id !== id)
      history.replaceState(null, "", href(id));
  }
  function updateActive() {
    if (scrollLock) return;
    const chapters = [...document.querySelectorAll(".project-chapter")];
    let current = chapters[0];
    const threshold = matchMedia("(max-width: 800px)").matches ? 230 : 170;
    for (const item of chapters) if (item.getBoundingClientRect().top <= threshold) current = item;
    if (current) activate(current.id, true);
  }
  function jump(id, smooth = false) {
    const target = document.getElementById(id);
    if (!target || !ownerOf(id)) return false;
    clearTimeout(unlockTimer);
    scrollLock = id;
    activate(ownerOf(id).id);
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior:
        smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant",
      block: "start",
    });
    unlockTimer = setTimeout(
      () => {
        scrollLock = "";
        updateActive();
      },
      smooth ? 1100 : 120,
    );
    return true;
  }
  function observeMedia() {
    mediaObserver?.disconnect();
    const videos = [...document.querySelectorAll("video[data-video-src]")];
    if (!("IntersectionObserver" in window)) {
      videos.forEach((v) => {
        v.src = v.dataset.videoSrc;
      });
      return;
    }
    mediaObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting && !target.getAttribute("src")) target.src = target.dataset.videoSrc;
          if (!isIntersecting) target.pause();
        }),
      { rootMargin: "200px" },
    );
    videos.forEach((v) => mediaObserver.observe(v));
  }
  function render() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = `${w("核心项目", "Selected Projects")} · ${l(data?.profile.name)}`;
    document.querySelector('meta[name="description"]').content = projects
      .map((p) => l(p.title))
      .join(" · ");
    document.getElementById("project-nav").innerHTML =
      `<a class="back-home" href="./#projects">← ${w("返回主页", "Back to homepage")}</a><span class="nav-label">${w("项目作品集", "PROJECT PORTFOLIO")}</span><div class="language-switch" role="group" aria-label="Language">${["zh", "en"].map((code) => `<button data-language="${code}" aria-pressed="${lang === code}">${code === "zh" ? "中文" : "EN"}</button>`).join("")}</div>`;
    document.getElementById("project-directory").innerHTML =
      `<div class="directory-heading"><span>${w("项目目录", "CONTENTS")}</span><small>${String(projects.length).padStart(2, "0")} ${w("个项目", "PROJECTS")}</small></div><nav aria-label="${w("核心项目目录", "Project directory")}">${projects.map((p, i) => `<a data-jump data-project-link="${esc(p.id)}" href="${href(p.id)}"><span class="directory-number">${number(i)}</span><span>${esc(titleParts(p)[0])}<small>${esc(titleParts(p)[1])}</small></span><span class="directory-arrow">↗</span></a>`).join("")}</nav><p class="directory-note">${w("技术路线、系统设计与项目实践。", "Technical approaches, system design and project work.")}</p>`;
    document.getElementById("project-content").innerHTML =
      `<header class="portfolio-intro"><p class="eyebrow">SELECTED WORK / ${String(projects.length).padStart(2, "0")}</p><h1>${w("核心项目", "Selected Projects")}<span>.</span></h1><p>${w("从技术路线到系统实现，记录每一个项目。", "From technical approaches to system implementation.")}</p></header><p id="link-notice" class="link-notice" hidden>${w("原链接未找到对应项目，以下展示全部项目。", "The requested project was not found. All projects are listed below.")}</p>${projects.map(chapter).join("")}`;
    document
      .getElementById("viewer-close")
      .setAttribute("aria-label", w("关闭图片", "Close image"));
    document.getElementById("viewer-original").textContent = w("打开原图 ↗", "Open original ↗");
    document
      .getElementById("viewer-zoom")
      .setAttribute("aria-label", w("切换图片原始尺寸", "Toggle original image size"));
    observeMedia();
  }
  document.addEventListener("click", (event) => {
    const language = event.target.closest("[data-language]");
    if (language) {
      const current = ownerOf(readHash()) ? readHash() : activeId;
      lang = language.dataset.language;
      try {
        localStorage.setItem("academic-language", lang);
      } catch {}
      render();
      jump(current);
      return;
    }
    const nav = event.target.closest("a[data-jump]");
    if (
      nav &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      const id = decodeURIComponent(new URL(nav.href).hash.slice(1));
      if (location.hash !== href(id)) history.pushState(null, "", href(id));
      jump(id, true);
      return;
    }
    const figure = event.target.closest("a[data-enlarge]");
    if (
      figure &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      const img = figure.querySelector("img");
      document.getElementById("viewer-image").src = img.src;
      document.getElementById("viewer-image").alt = img.alt;
      document.getElementById("viewer-title").textContent = w("技术图与项目图片", "Project image");
      document.getElementById("viewer-original").href = img.src;
      dialog.classList.remove("original-size");
      document.getElementById("viewer-zoom").textContent = "100%";
      dialog.showModal();
    }
  });
  document.getElementById("viewer-close").addEventListener("click", () => dialog.close());
  document.getElementById("viewer-zoom").addEventListener("click", () => {
    const original = dialog.classList.toggle("original-size");
    document.getElementById("viewer-zoom").textContent = original ? w("适应窗口", "Fit") : "100%";
  });
  window.addEventListener("hashchange", () => {
    if (!jump(readHash())) updateActive();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          updateActive();
        });
    },
    { passive: true },
  );
  window.addEventListener("resize", updateActive);
  for (const event of ["wheel", "touchstart"])
    window.addEventListener(
      event,
      () => {
        clearTimeout(unlockTimer);
        scrollLock = "";
      },
      { passive: true },
    );
  // Old individual URLs continue at the matching chapter, including section hashes.
  const legacy = new URLSearchParams(location.search).get("id");
  let missing = false;
  if (legacy) {
    const p = projects.find((p) => p.id === legacy);
    if (p) {
      const old = readHash();
      const target = blocks().some(([key]) => key === old) ? blockId(p, old) : p.id;
      history.replaceState(null, "", `${location.pathname}${href(target)}`);
    } else missing = true;
  }
  render();
  const target = readHash();
  if (target && ownerOf(target)) requestAnimationFrame(() => jump(target));
  else {
    if (missing || target) document.getElementById("link-notice").hidden = false;
    updateActive();
  }
})();
