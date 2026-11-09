/* Content lives in data/site.json. This file only renders the interface. */
(() => {
  "use strict";
  const data = window.SITE_DATA;
  const github = window.GITHUB_DATA || { status: "pending", calendars: [], mergedPRs: [] };
  if (!data) {
    document.getElementById("content").innerHTML =
      '<div class="error-panel">请先运行 node scripts/build.mjs，再运行 node scripts/serve.mjs。</div>';
    return;
  }
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const safeUrl = (value) => {
    if (!value || typeof value !== "string") return "";
    try {
      const u = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  let lang = data.defaultLanguage || "zh";
  try {
    const saved = localStorage.getItem("academic-language");
    if (["zh", "en"].includes(saved)) lang = saved;
  } catch {}
  const l = (value) =>
    typeof value === "object" && value !== null
      ? (value[lang] ?? value.zh ?? value.en ?? "")
      : (value ?? "");
  const w = (zh, en) => (lang === "zh" ? zh : en);
  const svgPaths = {
    github:
      '<path fill="currentColor" stroke="none" d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.52.1.72-.22.72-.5v-1.96c-2.92.63-3.54-1.24-3.54-1.24-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.05.07 1.6 1.08 1.6 1.08.93 1.6 2.45 1.14 3.05.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.79 0 0 .89-.29 2.89 1.07A10 10 0 0 1 12 6.53c.9 0 1.79.12 2.63.36 2-1.36 2.88-1.07 2.88-1.07.57 1.45.21 2.52.11 2.79.67.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.92-4.8 5.18.38.33.71.97.71 1.96v2.88c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z"/>',
    cap: '<path d="m2 8 10-5 10 5-10 5L2 8Zm4 2v7c4 3 8 3 12 0v-7M22 8v8"/>',
    layers: '<path d="m12 3 10 6-10 6L2 9l10-6ZM2 13l10 6 10-6M2 17l10 6 10-6"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    network:
      '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m10.5 8-4 7m7-7 4 7M8 18h8"/>',
    people:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5v2"/>',
    code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-2 20"/>',
    research: '<circle cx="10" cy="10" r="6"/><path d="m15 15 7 7M7 10h6m-3-3v6"/>',
    medal: '<circle cx="12" cy="9" r="6"/><path d="m8 14-3 8 7-3 7 3-3-8"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgPaths[name] || svgPaths.layers}</svg>`;
  const link = (url, text, cls = "") =>
    `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer"${cls ? ` class="${cls}"` : ""}>${text}</a>`;
  const sections = [
    ["about", "关于", "About", "关于我", "ABOUT ME", "👋"],
    ["education", "教育", "Education", "教育背景", "EDUCATION", "🎓"],
    ["honors", "荣誉", "Honors", "荣誉与奖项", "HONORS & AWARDS", "🏆"],
    ["publications", "论文", "Papers", "论文成果", "PUBLICATIONS", "📝"],
    ["projects", "项目", "Projects", "核心项目", "FEATURED PROJECTS", "💻"],
    ["opensource", "开源", "Open source", "开源贡献", "OPEN SOURCE", icon("github")],
  ];
  let observer,
    selectedYear = github.calendars?.[0]?.year;
  function heading(id, action = "") {
    const s = sections.find((x) => x[0] === id),
      tag = id === "about" ? "h1" : "h2";
    return `<div class="section-heading"><span class="section-icon" aria-hidden="true">${s[5]}</span><${tag} id="${id}-title">${esc(
      w(
        s[3],
        s[4].toLowerCase().replace(/\b\w/g, (x) => x.toUpperCase()),
      ),
    )}</${tag}>${lang === "zh" ? `<span class="section-en">${s[4]}</span>` : ""}${id === "about" ? "" : '<span class="section-rule"></span>'}${action}</div>`;
  }
  function sideSection(title, en, content) {
    return `<section class="side-section"><h2>${esc(w(title, en))}</h2>${lang === "zh" ? `<p class="eyebrow">${en}</p>` : '<div style="height:16px"></div>'}${content}</section>`;
  }
  function sidebar() {
    const p = data.profile;
    return `<div class="brand"><strong>${esc(p.initials)} /</strong><span>ACADEMIC PROFILE</span></div><div class="profile-head"><img class="profile-avatar" src="${esc(p.avatar)}" alt="${esc(w("海边黑猫头像", "Black cat looking out at the sea"))}" width="166" height="166"><h2 class="profile-name">${esc(l(p.name))}</h2><div class="romanized">${esc(p.romanized)}</div><div class="handle">${esc(p.handle)}</div><p class="profile-role">${esc(l(p.role))}</p><div class="profile-status"><span class="status-dot"></span>${esc(l(p.status))}</div></div>${sideSection(
      "基本信息",
      "BASIC INFORMATION",
      `<div class="info-list">${[
        ["cap", l(p.institution)],
        ["layers", l(p.lab)],
        ["pin", l(p.location)],
      ]
        .filter((x) => x[1])
        .map(([i, text]) => `<div class="info-row">${icon(i)}<span>${esc(text)}</span></div>`)
        .join(
          "",
        )}${p.email ? `<div class="info-row">${icon("mail")}<a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ""}</div><div class="side-actions">${p.cvUrl ? link(p.cvUrl, `${w("下载简历", "Download CV")} ↗`, "side-btn primary") : `<button class="side-btn primary" data-action="print">${w("导出简历", "Export CV")} ↗</button>`}${p.email ? `<a class="side-btn" href="mailto:${esc(p.email)}">${w("联系我", "Contact")} ↗</a>` : link(`https://github.com/${data.githubUsername}`, `${w("联系我", "Contact")} ↗`, "side-btn")}</div><div class="socials">${link(`https://github.com/${data.githubUsername}`, "GitHub ↗")}${p.scholarUrl ? link(p.scholarUrl, "Scholar ↗") : ""}${p.orcidUrl ? link(p.orcidUrl, "ORCID ↗") : ""}</div>`,
    )}${sideSection("研究方向", "RESEARCH INTERESTS", `<ul class="interests">${data.interests.map((x, i) => `<li>${icon(["layers", "people", "network"][i % 3])}<span>${esc(l(x))}</span></li>`).join("")}</ul>`)}${sideSection("专业技能", "SKILLS", data.skills.map((x, i) => `<div class="skill-group"><div class="skill-title">${icon(i ? "research" : "code")}${esc(l(x.title))}</div><div class="skill-tags">${x.items.map((item) => `<span>${esc(l(item))}</span>`).join("")}</div>`).join(""))}<div class="side-footer"><div>${icon("github")}<span>${w("最近更新", "Updated")} / ${esc(p.updated)}</span></div></div>`;
  }
  function nav() {
    return `<button class="mobile-profile" data-action="profile" aria-expanded="${document.getElementById("sidebar").classList.contains("expanded")}" aria-controls="sidebar">${icon("menu")}${w("个人资料", "Profile")}</button><nav class="nav-links" aria-label="${w("页面导航", "Page navigation")}">${sections.map((s) => `<a href="#${s[0]}" data-section="${s[0]}">${esc(w(s[1], s[2]))}</a>`).join("")}</nav><div class="language-switch" role="group" aria-label="Language">${["zh", "en"].map((code) => `<button data-language="${code}" class="${lang === code ? "active" : ""}" aria-pressed="${lang === code}">${code === "zh" ? "中文" : "EN"}</button>`).join("")}</div>`;
  }
  function education() {
    return data.education
      .map(
        (x) =>
          `<div class="education-row"><span class="date">${esc(l(x.period))}</span><div class="education-detail"><h3>${esc(l(x.school))}</h3><p>${esc(l(x.detail))}</p></div><span class="badge">${esc(l(x.degree))}</span></div>`,
      )
      .join("");
  }
  function awards() {
    return data.awards
      .map(
        (x) =>
          `<div class="award-row"><span class="award-icon">${icon("medal")}</span><div class="award-main"><strong>${esc(l(x.title))}</strong><small>${esc(l(x.organization))}</small></div><span class="award-year">${esc(x.year)}</span></div>`,
      )
      .join("");
  }
  function papers() {
    return data.publications
      .map(
        (x) =>
          `<article class="paper"><span class="paper-year">${esc(x.year)}</span><div class="paper-body"><h3>${esc(l(x.title))}</h3><p class="authors">${x.authors.map((a) => (a === x.highlightAuthor ? `<strong>${esc(a)}</strong>` : esc(a))).join(", ")}${l(x.role) ? `<span class="author-role">${esc(l(x.role))}</span>` : ""}</p><div class="paper-bottom"><div class="paper-meta"><span class="paper-status">${esc(l(x.status))}</span><span>${esc(l(x.venue))}</span></div><div class="paper-actions">${x.pdf ? link(x.pdf, "PDF ↗") : `<button class="text-button" disabled title="${w("PDF 待配置", "PDF not configured")}">PDF ↗</button>`}${x.code ? link(x.code, "Code ↗") : `<button class="text-button" disabled title="${w("代码链接待配置", "Code not configured")}">Code ↗</button>`}${x.bibtex ? `<button class="text-button" data-bibtex="${esc(x.id)}">BibTeX</button>` : ""}</div></div></div></article>`,
      )
      .join("");
  }
  function projects() {
    return `<div class="project-grid">${data.projects
      .map(
        (x) =>
          `<article class="project">${x.repository ? link(x.repository, `<img class="project-cover" src="${esc(x.cover)}" alt="${esc(l(x.title))}" loading="lazy" width="600" height="324">`, "cover-link") : `<button class="cover-link" data-project="${esc(x.id)}" aria-label="${esc(l(x.title))}"><img class="project-cover" src="${esc(x.cover)}" alt="${esc(l(x.title))}" loading="lazy" width="600" height="324"></button>`}<div class="project-body"><h3>${x.repository ? link(x.repository, esc(l(x.title))) : `<button data-project="${esc(x.id)}">${esc(l(x.title))}</button>`}</h3><p class="project-description">${esc(l(x.description))}</p><dl class="project-facts">${[
            ["research", "研究", "Research"],
            ["role", "职责", "Role"],
            ["outcome", "成果", "Outcome"],
          ]
            .map(([key, zh, en]) => `<div><dt>${w(zh, en)}</dt><dd>${esc(l(x[key]))}</dd></div>`)
            .join(
              "",
            )}</dl><div class="tags">${x.tags.map((t) => `<span>${esc(l(t))}</span>`).join("")}</div><div class="project-links">${x.repository ? link(x.repository, `${icon("github")} GitHub ↗`) : `<button class="text-button" disabled title="${w("请在配置中填写仓库地址", "Add a repository URL in the configuration")}">${icon("github")} ${w("仓库待配置", "Repository pending")}</button>`}<button class="text-button" data-project="${esc(x.id)}">${w("项目详情", "Details")} ↗</button>${x.demo ? link(x.demo, "Demo ↗") : ""}</div></div></article>`,
      )
      .join("")}</div>`;
  }
  function contributionGroups() {
    const groups = new Map();
    for (const pr of github.mergedPRs || []) {
      if (!groups.has(pr.repository)) groups.set(pr.repository, []);
      groups.get(pr.repository).push(pr);
    }
    return [...groups.entries()];
  }
  function contributions() {
    const ready = github.status === "ready",
      groups = contributionGroups(),
      search = `https://github.com/search?q=${encodeURIComponent(`is:pr is:merged is:public author:${data.githubUsername} -user:${data.githubUsername}`)}&type=pullrequests`;
    return `<p class="contribution-summary">${ready ? w(`截至 ${esc((github.updatedAt || "").slice(0, 10))}，<strong>${github.mergedTotal}</strong> 个公开 PR 已合并至${github.truncated ? "至少 " : ""}<strong>${github.repositoriesTotal}</strong> 个上游开源项目。`, `As of ${esc((github.updatedAt || "").slice(0, 10))}, <strong>${github.mergedTotal}</strong> public PRs merged into ${github.truncated ? "at least " : ""}<strong>${github.repositoriesTotal}</strong> upstream projects.`) : w("公开贡献记录正在同步，以下内容会在获取 GitHub 数据后自动更新。", "Public contributions will appear here after GitHub synchronization.")} </p><p class="data-status">${w("来源", "Source")}: ${link(`https://github.com/${data.githubUsername}`, esc(data.githubUsername))} · ${w("仅统计公开、已合并、非本人名下仓库的 PR", "Public, merged PRs to repositories outside this account")}${github.truncated ? " · " + w("明细显示最近 1,000 条", "Latest 1,000 records shown") : ""}</p><div class="table-scroll"><table><thead><tr><th scope="col">${w("项目", "Project")}</th><th scope="col">${w("近期或代表性贡献", "Recent / representative contribution")}</th><th scope="col">${w("合并记录", "Merged PRs")}</th></tr></thead><tbody>${
      groups.length
        ? groups
            .slice(0, 6)
            .map(([repo, prs]) => {
              const override = data.contributionOverrides?.[repo];
              return `<tr><td>${link(`https://github.com/${repo}`, esc(repo.replace("/", " / ")))}</td><td>${esc(
                override
                  ? l(override)
                  : prs
                      .slice(0, 2)
                      .map((pr) => pr.title)
                      .join(" · "),
              )}</td><td><div class="pr-links">${prs
                .slice(0, 3)
                .map((pr) => link(pr.url, `#${pr.number} ↗`))
                .join("")}</div></td></tr>`;
            })
            .join("")
        : `<tr class="empty-row"><td colspan="3">${ready ? w("目前尚无符合条件的公开上游合并记录。新的贡献会在同步后自动出现在这里。", "No public merged upstream contributions yet. New contributions will appear after synchronization.") : w("等待 GitHub 数据同步。", "Waiting for GitHub data.")}</td></tr>`
    }</tbody></table></div><div class="contribution-links">${link(search, `${w("查看全部上游合并记录", "View all upstream merged PRs")} ↗`)}${groups.length ? `<button class="text-button" data-action="contributions">${w("查看贡献详情", "Contribution details")} ↗</button>` : ""}</div><div class="activity-panel"><div class="activity-header"><h3>${icon("github")}${w("贡献活跃度", "Contribution activity")}<small>GitHub Activity</small></h3><div class="activity-controls">${github.calendars?.length ? `<label><span class="sr-only" hidden>${w("年份", "Year")}</span><select id="calendar-year" aria-label="${w("选择贡献年份", "Contribution year")}">${github.calendars.map((c) => `<option value="${c.year}" ${c.year === selectedYear ? "selected" : ""}>${c.year}</option>`).join("")}</select></label>` : ""}${link(`https://github.com/${data.githubUsername}`, `${w("GitHub 主页", "GitHub profile")} ↗`)}</div></div><div id="calendar"></div></div>`;
  }
  function renderCalendar() {
    const el = document.getElementById("calendar"),
      c = github.calendars?.find((c) => c.year === selectedYear);
    if (!c) {
      el.innerHTML = `<div class="calendar-empty">${w("贡献日历暂不可用；同步成功后会显示真实数据。", "The contribution calendar is not available yet. Real data will appear after synchronization.")}</div>`;
      return;
    }
    const months =
      lang === "zh"
        ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let seen = new Set();
    const monthCells = c.weeks
      .map((week, i) => {
        const day = week.days.find((d) => d.date.startsWith(String(c.year)));
        if (!day) return "";
        const m = Number(day.date.slice(5, 7)) - 1;
        if (seen.has(m)) return "";
        seen.add(m);
        return `<span style="grid-column:${i + 1}">${months[m]}</span>`;
      })
      .join("");
    el.innerHTML = `<div class="calendar-scroll"><div class="calendar-layout" style="--weeks:${c.weeks.length}"><div class="weekdays"><span></span>${Array.from({ length: 7 }, (_, i) => `<span>${{ 1: w("一", "Mon"), 3: w("三", "Wed"), 5: w("五", "Fri") }[i] || ""}</span>`).join("")}</div><div class="calendar-main"><div class="months">${monthCells}</div><div class="heatmap" role="img" aria-label="${esc(w(`${c.year} 年贡献日历，共 ${c.total} 次贡献`, `${c.year} contribution calendar, ${c.total} contributions`))}">${c.weeks
      .map(
        (week) =>
          `<div class="heat-week">${Array.from({ length: 7 }, (_, weekday) => {
            const d = week.days.find((d) => d.weekday === weekday);
            if (!d) return '<span class="heat-cell empty"></span>';
            return `<span class="heat-cell" data-level="${Math.max(0, Math.min(4, d.level))}" title="${esc(`${d.date}: ${d.count} ${w("次贡献", "contributions")}`)}"></span>`;
          }).join("")}</div>`,
      )
      .join(
        "",
      )}</div></div></div></div><div class="activity-footer"><span>${w("统计范围", "Period")}: ${esc(c.from.slice(0, 10))} — ${esc(c.to.slice(0, 10))}<br>${w("最后同步", "Last synced")}: ${esc(formatDate(github.updatedAt))} · ${c.total} ${w("次贡献", "contributions")}</span><div class="legend"><span>${w("少", "Less")}</span>${[0, 1, 2, 3, 4].map((n) => `<span class="legend-cell" data-level="${n}"></span>`).join("")}<span>${w("多", "More")}</span></div></div>`;
  }
  function formatDate(value) {
    return value
      ? new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-GB", {
          timeZone: "Asia/Shanghai",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : w("等待同步", "Not synced");
  }
  function render() {
    const main = document.getElementById("main-pane"),
      oldScroll = main.scrollTop,
      side = document.getElementById("sidebar"),
      sideScroll = side.scrollTop;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = `${l(data.profile.name)} · ${w("个人学术主页", "Academic Homepage")}`;
    side.setAttribute("aria-label", w("个人信息", "Profile"));
    side.innerHTML = sidebar();
    document.getElementById("topbar").innerHTML = nav();
    document.getElementById("content").innerHTML =
      `<section id="about" class="content-section about-section" aria-labelledby="about-title">${heading("about")}<div class="about-copy">${data.about.map((p) => `<p>${esc(l(p))}</p>`).join("")}</div>${data.news ? `<div class="news"><span class="status-dot"></span><span class="news-label">${w("近况", "Now")}</span><span class="news-date">${esc(data.news.date)}</span><span>${esc(l(data.news.text))}</span></div>` : ""}${data.demo ? `<div class="demo-note"><span>${w("示例资料", "DEMO PROFILE")}</span>${w("履历、论文和项目为可替换的示例；GitHub 区域展示真实公开数据。", "Biography, papers, and projects are examples. The GitHub section uses real public data.")}</div>` : ""}</section><section id="education" class="content-section" aria-labelledby="education-title">${heading("education")}${education()}</section><section id="honors" class="content-section" aria-labelledby="honors-title">${heading("honors")}${awards()}</section><section id="publications" class="content-section" aria-labelledby="publications-title">${heading("publications")}${papers()}</section><section id="projects" class="content-section" aria-labelledby="projects-title">${heading("projects", `<a class="section-action" href="https://github.com/${esc(data.githubUsername)}?tab=repositories" target="_blank" rel="noopener noreferrer">${w("全部仓库", "All repositories")} ↗</a>`)}${projects()}</section><section id="opensource" class="content-section" aria-labelledby="opensource-title">${heading("opensource")}${contributions()}</section><footer class="site-footer"><span>© ${new Date().getFullYear()} ${esc(l(data.profile.name))}</span><div class="footer-links">${data.demo ? `<span>${w("履历与项目为示例", "Example biography & projects")}</span>` : ""}${link(`https://github.com/${data.repository}`, "Open source ↗")}</div></footer>`;
    renderCalendar();
    main.scrollTop = oldScroll;
    side.scrollTop = sideScroll;
    setupObserver();
  }
  function setupObserver() {
    observer?.disconnect();
    updateActive();
  }
  function updateActive() {
    const top = document.getElementById("topbar").getBoundingClientRect().bottom + 28;
    let current = "about";
    document.querySelectorAll(".content-section").forEach((section) => {
      if (section.getBoundingClientRect().top <= top) current = section.id;
    });
    setActive(current);
  }
  function setActive(id) {
    document.querySelectorAll("[data-section]").forEach((a) => {
      const active = a.dataset.section === id;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  const dialog = document.getElementById("detail-dialog");
  function openDialog(html) {
    document.getElementById("dialog-content").innerHTML = html;
    dialog.showModal();
  }
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const b = dialog.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom)
        dialog.close();
    }
  });
  let toastTimer;
  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 2600);
  }
  document.addEventListener("click", async (e) => {
    const language = e.target.closest("[data-language]");
    if (language) {
      lang = language.dataset.language;
      try {
        localStorage.setItem("academic-language", lang);
      } catch {}
      render();
      return;
    }
    const navLink = e.target.closest("[data-section]");
    if (navLink) {
      e.preventDefault();
      const target = document.getElementById(navLink.dataset.section);
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
      history.replaceState(null, "", `#${target.id}`);
      setActive(target.id);
      return;
    }
    const project = e.target.closest("[data-project]");
    if (project) {
      const p = data.projects.find((p) => p.id === project.dataset.project);
      openDialog(
        `<img class="details-cover" src="${esc(p.cover)}" alt=""><h2>${esc(l(p.title))}</h2><p>${esc(l(p.details))}</p><dl class="project-facts">${[
          ["research", "研究内容", "Research"],
          ["role", "我的职责", "My role"],
          ["outcome", "项目成果", "Outcome"],
        ]
          .map(([k, z, en]) => `<div><dt>${w(z, en)}</dt><dd>${esc(l(p[k]))}</dd></div>`)
          .join("")}</dl>${p.repository ? link(p.repository, `${icon("github")} GitHub ↗`) : ""}`,
      );
      return;
    }
    const bib = e.target.closest("[data-bibtex]");
    if (bib) {
      const p = data.publications.find((p) => p.id === bib.dataset.bibtex);
      openDialog(
        `<h2>BibTeX</h2><pre>${esc(p.bibtex)}</pre><button class="dialog-action" data-copy-bibtex="${esc(p.id)}">${w("复制引用", "Copy citation")}</button>`,
      );
      return;
    }
    const copy = e.target.closest("[data-copy-bibtex]");
    if (copy) {
      const p = data.publications.find((p) => p.id === copy.dataset.copyBibtex);
      try {
        await navigator.clipboard.writeText(p.bibtex);
        toast(w("引用已复制", "Citation copied"));
      } catch {
        toast(w("请选中上方内容复制", "Select the text above to copy"));
      }
      return;
    }
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "print") window.print();
    if (action === "profile") {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("expanded");
      e.target
        .closest("button")
        .setAttribute("aria-expanded", sidebar.classList.contains("expanded"));
      if (sidebar.classList.contains("expanded")) sidebar.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "contributions")
      openDialog(
        `<h2>${w("上游合并记录", "Upstream merged contributions")}</h2><div class="all-contributions">${(github.mergedPRs || []).map((pr) => `<article>${link(pr.url, `${esc(pr.repository)} #${pr.number} ↗`)}<p>${esc(pr.title)}</p><p>${w("已合并", "Merged")} · ${esc(pr.mergedAt.slice(0, 10))}</p></article>`).join("")}</div>`,
      );
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "calendar-year") {
      selectedYear = Number(e.target.value);
      renderCalendar();
    }
  });
  let scrollFrame = 0;
  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateActive();
    });
  }
  document.getElementById("main-pane").addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  matchMedia("(min-width:761px)").addEventListener("change", () => setupObserver());
  render();
  if (location.hash) {
    requestAnimationFrame(() =>
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" }),
    );
  }
})();
