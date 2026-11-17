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
  const blocks = (project) =>
    project?.detailPage?.layout === "showcase"
      ? [
          ["overview", w("项目概览", "Overview")],
          ["workflow", w("系统架构", "Architecture")],
          ["hardware", l(project.detailPage.hardware?.title) || w("整车结构", "Hardware")],
          ["videos", w("功能演示", "Demos")],
          ["achievements", w("成果与实践", "Outcomes")],
        ]
      : [
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
    const title = blocks(project).find((b) => b[0] === key)[1];
    return `<section class="detail-section${content ? "" : " pending-section"}" id="${esc(blockId(project, key))}" tabindex="-1"><h3>${esc(title)}</h3>${content || `<p class="empty">${w("内容待补充", "Content coming soon")}</p>`}</section>`;
  }
  function chapter(project, index) {
    const page = project.detailPage || {};
    if (page.layout === "showcase") return showcaseChapter(project, index);
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
    return `<article class="project-chapter" id="${esc(project.id)}" tabindex="-1"><header class="chapter-heading"><p class="eyebrow"><span>${number(index)}</span> / ${w("核心项目", "SELECTED PROJECT")}</p><div class="project-hero"><div><h2>${esc(title)}</h2>${subtitle ? `<p class="project-subtitle">${esc(subtitle)}</p>` : ""}${paragraph(project.description)}<div class="tags">${(project.tags || []).map((tag) => `<span>${esc(l(tag))}</span>`).join("")}</div><div class="project-actions">${link(project.repository, "GitHub", "repo-link")}${link(project.demo, w("在线演示", "Live demo"))}</div></div><div class="hero-visual"><img class="hero-cover" src="${esc(url(project.cover))}" alt="${esc(l(project.title))}" width="600" height="400" loading="${index ? "lazy" : "eager"}"></div></div></header><nav class="section-nav" aria-label="${esc(title)} ${w("章节", "sections")}">${blocks()
      .map(([key, text]) => `<a data-jump href="${href(blockId(project, key))}">${esc(text)}</a>`)
      .join(
        "",
      )}</nav>${projectBlock(project, "overview", paragraph(project.details || project.description) + (l(project.outcome) ? `<div class="outcome"><span>${w("项目成果", "OUTCOME")}</span>${paragraph(project.outcome)}</div>` : ""))}${projectBlock(project, "workflow", visual(page.workflow?.image, page.workflow?.description) + (page.workflow?.image ? "" : paragraph(page.workflow?.description)))}${projectBlock(project, "hardware", visual(page.hardware?.image, page.hardware?.description, "4 / 3") + (page.hardware?.image ? "" : paragraph(page.hardware?.description)))}${projectBlock(project, "videos", videos)}${projectBlock(project, "achievements", achievements)}${index === projects.length - 1 ? `<div class="chapter-end"><a href="./#projects">← ${w("返回主页", "Back to homepage")}</a></div>` : ""}</article>`;
  }
  const selectedDemos = new Map();
  const selectedParts = new Map();
  const blankMedia = (label) =>
    `<div class="media-placeholder" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;
  function demoMedia(item, label) {
    if (!url(item?.url))
      return url(item?.image)
        ? `<div class="demo-still">${visual(item.image, label, "16 / 10")}</div>`
        : blankMedia(w("视频待补充", "Video coming soon"));
    if (item.type === "link")
      return `<div class="external-demo">${url(item.poster) ? `<img src="${esc(url(item.poster))}" alt="${esc(label)}">` : ""}${link(item.url, w("打开演示视频", "Watch demonstration"), "external-video")}</div>`;
    return `<video controls playsinline preload="none" data-video-src="${esc(url(item.url))}" aria-label="${esc(label)}"${url(item.poster) ? ` poster="${esc(url(item.poster))}"` : ""}></video>`;
  }
  function demoStage(project, index) {
    const item = project.detailPage.videos?.[index];
    if (!item) return blankMedia(w("演示资料待补充", "Demo coming soon"));
    const primaryLabel = l(item.viewLabel) || w("实物端", "Physical view");
    const secondaryLabel = l(item.secondaryLabel) || w("Qt 端", "Qt interface");
    if (item.display === "single")
      return `<div class="demo-primary"><div class="demo-view-label">${esc(primaryLabel)}</div><div class="demo-screen">${demoMedia(item, l(item.title))}</div>${url(item.url) ? link(item.url, w("打开演示视频", "Open demo video"), "media-original") : ""}</div><div class="demo-description"><span class="demo-index">DEMO ${number(index)} / ${number(project.detailPage.videos.length - 1)}</span><h4>${esc(l(item.title))}</h4>${paragraph(item.description)}</div>`;
    if (item.display === "qt-only")
      return `<div class="demo-primary"><div class="demo-view-label">${w("Qt 界面", "Qt interface")}</div><div class="demo-screen">${demoMedia(item.qt, l(item.title))}</div>${url(item.qt?.url) ? link(item.qt.url, w("打开 Qt 视频", "Open Qt video"), "media-original") : ""}</div><div class="demo-description"><span class="demo-index">DEMO ${number(index)} / ${number(project.detailPage.videos.length - 1)}</span><h4>${esc(l(item.title))}</h4>${paragraph(item.description)}</div>`;
    return `<div class="demo-primary"><div class="demo-view-label">${esc(primaryLabel)}</div><div class="demo-screen">${demoMedia(item, `${l(item.title)} · ${primaryLabel}`)}</div>${url(item.url) ? link(item.url, w("打开实物端视频", "Open physical video"), "media-original") : ""}</div><div class="demo-description"><span class="demo-index">DEMO ${number(index)} / ${number(project.detailPage.videos.length - 1)}</span><h4>${esc(l(item.title))}</h4>${paragraph(item.description)}<div class="qt-demo"><div class="demo-view-label">${esc(secondaryLabel)}</div>${demoMedia(item.qt, `${l(item.title)} · ${secondaryLabel}`)}${url(item.qt?.url) ? link(item.qt.url, w("打开 Qt 视频", "Open Qt video"), "media-original") : ""}</div></div>`;
  }
  function hardwareDetail(project, index) {
    const item = project.detailPage.hardware?.parts?.[index];
    if (!item) return "";
    return `${url(item.url) ? `<video class="hardware-animation" controls muted playsinline preload="none" data-video-src="${esc(url(item.url))}" aria-label="${esc(l(item.title))}"${url(item.poster) ? ` poster="${esc(url(item.poster))}"` : ""}></video>` : url(item.image) ? visual(item.image, item.title, "2 / 1") : blankMedia(w("部件资料待补充", "Component material coming soon"))}<div class="hardware-caption"><div><h4>${esc(l(item.title))}</h4>${paragraph(item.description)}</div>${url(item.url) ? `<button type="button" data-replay-hardware>${w("重新播放", "Replay")}</button>` : ""}</div>`;
  }
  function showcaseChapter(project, index) {
    const page = project.detailPage;
    const [title, subtitle] = titleParts(project);
    const videos = page.videos || [];
    const selected = Math.min(selectedDemos.get(project.id) || 0, Math.max(videos.length - 1, 0));
    const parts = page.hardware?.parts || [];
    const defaultPart = Math.max(
      parts.findIndex((part) => part.id === page.hardware?.defaultPart),
      0,
    );
    const partIndex = Math.min(
      selectedParts.get(project.id) ?? defaultPart,
      Math.max(parts.length - 1, 0),
    );
    const demos = `<div class="demo-selector" role="group" aria-label="${w("选择演示场景", "Choose a demo")}">${videos.map((v, i) => `<button type="button" data-demo="${i}" aria-pressed="${i === selected}">${esc(l(v.title))}</button>`).join("")}</div><div class="demo-stage" id="${esc(project.id)}-demo-stage" aria-live="polite">${demoStage(project, selected)}</div><div class="demo-thumbnails" role="group" aria-label="${w("演示缩略图", "Demo thumbnails")}">${videos.map((v, i) => `<button type="button" data-demo="${i}" aria-pressed="${i === selected}" aria-controls="${esc(project.id)}-demo-stage"><span class="thumbnail-image">${url(v.poster) ? `<img src="${esc(url(v.poster))}" alt="" loading="lazy">` : `<span>${w("待补充", "Coming soon")}</span>`}</span><span><small>${number(i)}</small>${esc(l(v.title))}</span></button>`).join("")}</div>`;
    const hardware = `<p class="hardware-intro">${esc(l(page.hardware?.description) || w("选择功能模块，查看对应硬件的分解与旋转展示。", "Choose a module to explore its exploded and rotating hardware view."))}</p><div class="hardware-explorer"><div class="part-selector" role="group" aria-label="${w("查看硬件部件", "Explore components")}">${parts.map((item, i) => `<button type="button" data-part="${i}" aria-pressed="${i === partIndex}" aria-controls="${esc(project.id)}-hardware-detail"><span>${esc(l(item.title))}</span>${l(item.subtitle) ? `<small>${esc(l(item.subtitle))}</small>` : ""}</button>`).join("")}</div><div class="hardware-detail" id="${esc(project.id)}-hardware-detail" aria-live="polite">${hardwareDetail(project, partIndex)}</div></div>`;
    const achievements = `<div class="showcase-pair">${(page.achievements || []).map((item) => `<article class="showcase-card"><h4>${esc(l(item.title))}</h4>${url(item.image) ? visual(item.image, item.title, "16 / 10") : blankMedia(w("成果资料待补充", "Outcome material coming soon"))}${paragraph(item.description)}${link(item.url, w("相关资料", "Related material"))}</article>`).join("")}</div>`;
    return `<article class="project-chapter showcase" id="${esc(project.id)}" tabindex="-1"><header class="chapter-heading"><p class="eyebrow"><span>${number(index)}</span> / ${w("核心项目", "SELECTED PROJECT")}</p><div class="project-hero"><div><h2>${esc(title)}</h2><p class="project-subtitle">${esc(subtitle)}</p>${paragraph(project.description)}<div class="tags">${(project.tags || []).map((tag) => `<span>${esc(l(tag))}</span>`).join("")}</div><div class="project-actions"><a class="watch-demo" data-jump href="${href(blockId(project, "videos"))}">▷ ${w("观看功能演示", "Explore demos")}</a>${link(project.repository, "GitHub", "repo-link")}</div></div><div class="hero-visual"><img class="hero-cover" src="${esc(url(project.cover))}" alt="${esc(l(project.title))}" width="600" height="400" loading="lazy"></div></div></header><nav class="section-nav" aria-label="${esc(title)} ${w("章节", "sections")}">${blocks(
      project,
    )
      .map(([key, text]) => `<a data-jump href="${href(blockId(project, key))}">${esc(text)}</a>`)
      .join(
        "",
      )}</nav>${projectBlock(project, "overview", paragraph(page.intro || project.description))}${projectBlock(project, "workflow", visual(page.workflow?.image, page.workflow?.description))}${projectBlock(project, "hardware", hardware)}${projectBlock(project, "videos", demos)}${projectBlock(project, "achievements", achievements)}${index === projects.length - 1 ? `<div class="chapter-end"><a href="./#projects">← ${w("返回主页", "Back to homepage")}</a></div>` : ""}</article>`;
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
    return projects.find((p) => p.id === id || blocks(p).some(([key]) => blockId(p, key) === id));
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
    document.querySelectorAll("[data-chapter-directory]").forEach((group) => {
      group.hidden = group.dataset.chapterDirectory !== id;
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
    document.querySelectorAll(".showcase").forEach((chapter) => {
      let section = chapter.querySelector(".detail-section");
      chapter.querySelectorAll(".detail-section").forEach((item) => {
        if (item.getBoundingClientRect().top <= threshold + 40) section = item;
      });
      const directory = [...document.querySelectorAll("[data-chapter-directory]")].find(
        (group) => group.dataset.chapterDirectory === chapter.id,
      );
      [
        ...chapter.querySelectorAll(".section-nav a"),
        ...(directory?.querySelectorAll("a") || []),
      ].forEach((a) => {
        if (section && decodeURIComponent(a.hash.slice(1)) === section.id)
          a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    });
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
      `<a class="back-home" href="./#projects">← ${w("返回主页", "Back to homepage")}</a><div class="language-switch" role="group" aria-label="Language">${["zh", "en"].map((code) => `<button data-language="${code}" aria-pressed="${lang === code}">${code === "zh" ? "中文" : "EN"}</button>`).join("")}</div>`;
    document.getElementById("project-directory").innerHTML =
      `<div class="directory-heading"><span>${w("项目目录", "CONTENTS")}</span><small>${String(projects.length).padStart(2, "0")} ${w("个项目", "PROJECTS")}</small></div><nav aria-label="${w("核心项目目录", "Project directory")}">${projects.map((p, i) => `<a data-jump data-project-link="${esc(p.id)}" href="${href(p.id)}"><span class="directory-number">${number(i)}</span><span>${esc(titleParts(p)[0])}<small>${esc(titleParts(p)[1])}</small></span><span class="directory-arrow">↗</span></a>`).join("")}</nav>`;
    document.getElementById("project-directory").insertAdjacentHTML(
      "beforeend",
      projects
        .filter((p) => p.detailPage?.layout === "showcase")
        .map(
          (p) =>
            `<div class="directory-chapters" data-chapter-directory="${esc(p.id)}" role="navigation" aria-label="${esc(l(p.title))}" hidden>${blocks(
              p,
            )
              .map(([key, text]) => `<a data-jump href="${href(blockId(p, key))}">${esc(text)}</a>`)
              .join("")}</div>`,
        )
        .join(""),
    );
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
    const replay = event.target.closest("[data-replay-hardware]");
    if (replay) {
      const video = replay.closest(".hardware-detail").querySelector("video");
      if (video) {
        if (!video.getAttribute("src")) video.src = video.dataset.videoSrc;
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      return;
    }
    const demo = event.target.closest("button[data-demo]");
    const part = event.target.closest("button[data-part]");
    if (demo || part) {
      const button = demo || part;
      const chapter = button.closest(".project-chapter");
      const project = projects.find((p) => p.id === chapter?.id);
      if (!project) return;
      const index = Number(demo ? button.dataset.demo : button.dataset.part);
      if (demo) {
        chapter.querySelectorAll("video").forEach((v) => v.pause());
        selectedDemos.set(project.id, index);
        chapter.querySelector(".demo-stage").innerHTML = demoStage(project, index);
        chapter
          .querySelectorAll("[data-demo]")
          .forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.demo) === index));
        observeMedia();
      } else {
        chapter.querySelectorAll(".hardware-detail video").forEach((v) => v.pause());
        selectedParts.set(project.id, index);
        chapter.querySelector(".hardware-detail").innerHTML = hardwareDetail(project, index);
        chapter
          .querySelectorAll("[data-part]")
          .forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.part) === index));
        observeMedia();
        const video = chapter.querySelector(".hardware-detail video");
        if (video) {
          video.src = video.dataset.videoSrc;
          if (!matchMedia("(prefers-reduced-motion: reduce)").matches) video.play().catch(() => {});
        }
      }
      return;
    }
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
      const target = blocks(p).some(([key]) => key === old) ? blockId(p, old) : p.id;
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
