import { readFile } from "node:fs/promises";

export const configFile = new URL("../config.jsonc", import.meta.url);

// Strip comments without touching URL strings, escaped quotes, or line numbers.
export function parseJSONC(source, label = "config.jsonc") {
  const chars = [...source.replace(/^\uFEFF/, "")];
  let quoted = false;
  for (let i = 0; i < chars.length; i++) {
    if (quoted) {
      if (chars[i] === "\\") i++;
      else if (chars[i] === '"') quoted = false;
      continue;
    }
    if (chars[i] === '"') {
      quoted = true;
      continue;
    }
    if (chars[i] === "/" && chars[i + 1] === "/") {
      while (i < chars.length && chars[i] !== "\n") chars[i++] = " ";
    } else if (chars[i] === "/" && chars[i + 1] === "*") {
      const start = i;
      chars[i++] = " ";
      chars[i++] = " ";
      while (i < chars.length && !(chars[i] === "*" && chars[i + 1] === "/")) {
        if (chars[i] !== "\n" && chars[i] !== "\r") chars[i] = " ";
        i++;
      }
      if (i === chars.length) {
        const line = chars.slice(0, start).filter((c) => c === "\n").length + 1;
        throw new Error(`${label}: 第 ${line} 行的 /* 注释缺少 */。`);
      }
      chars[i] = chars[++i] = " ";
    }
  }
  quoted = false;
  for (let i = 0; i < chars.length; i++) {
    if (quoted) {
      if (chars[i] === "\\") i++;
      else if (chars[i] === '"') quoted = false;
    } else if (chars[i] === '"') quoted = true;
    else if (chars[i] === ",") {
      let next = i + 1;
      while (/\s/.test(chars[next] || "x")) next++;
      if (chars[next] === "}" || chars[next] === "]") chars[i] = " ";
    }
  }
  try {
    return JSON.parse(chars.join(""));
  } catch (error) {
    throw new Error(`${label}: 配置格式有误，请检查双引号、逗号和括号。${error.message}`);
  }
}

export function localize(value, language) {
  return typeof value === "string" ? value : (value?.[language] ?? value?.zh ?? value?.en ?? "");
}

export function normalizeConfig(input) {
  const fail = (field, reason) => {
    throw new Error(`config.jsonc → ${field}: ${reason}`);
  };
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail("根节点", "必须是 {} 对象。");
  const site = structuredClone(input);
  site.internships ??= [];
  if (!site.profile || typeof site.profile !== "object") fail("profile", "请保留个人资料对象。");
  for (const field of [
    "education",
    "awards",
    "internships",
    "publications",
    "projects",
    "interests",
    "skills",
    "about",
  ])
    if (!Array.isArray(site[field])) fail(field, "必须是列表 []；不显示内容时填写 []。");
  for (const [index, entry] of site.internships.entries()) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      fail(`internships[${index}]`, "每条实习经历必须是 {} 对象。");
    for (const field of ["company", "position", "period", "description"]) {
      const value = entry[field];
      if (
        value !== undefined &&
        typeof value !== "string" &&
        !(
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          Object.values(value).every((text) => typeof text === "string")
        )
      )
        fail(`internships[${index}].${field}`, "请填写文字或包含 zh / en 的双语对象。");
    }
    if (!localize(entry.company, "zh").trim())
      fail(`internships[${index}].company`, "请填写公司或机构名称。");
  }
  site.defaultLanguage ??= "zh";
  for (const [index, project] of site.projects.entries()) {
    const page = project.detailPage;
    if (page === undefined) continue;
    const prefix = `projects[${index}].detailPage`;
    const object = (value, field) => {
      if (!value || typeof value !== "object" || Array.isArray(value))
        fail(field, "必须是 {} 对象。");
    };
    const media = (value, field) => {
      if (value !== undefined && typeof value !== "string")
        fail(field, "请填写相对文件路径或完整网址。");
      if (value && /^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))
        fail(field, "仅支持本项目相对路径或 HTTP(S) 网址。");
    };
    object(page, prefix);
    for (const key of ["workflow", "hardware"]) {
      if (page[key] === undefined) continue;
      object(page[key], `${prefix}.${key}`);
      media(page[key].image, `${prefix}.${key}.image`);
    }
    for (const key of ["videos", "achievements"]) {
      page[key] ??= [];
      if (!Array.isArray(page[key])) fail(`${prefix}.${key}`, "必须是列表 []。");
      for (const [itemIndex, item] of page[key].entries()) {
        const field = `${prefix}.${key}[${itemIndex}]`;
        object(item, field);
        for (const name of ["image", "poster", "url"]) media(item[name], `${field}.${name}`);
        if (key === "videos" && !["file", "link"].includes(item.type))
          fail(`${field}.type`, '请填写 "file"（MP4/WebM）或 "link"（视频平台链接）。');
      }
    }
  }
  if (!["zh", "en"].includes(site.defaultLanguage))
    fail("defaultLanguage", '只能填写 "zh" 或 "en"。');
  if (
    typeof site.githubUsername !== "string" ||
    !/^[a-z\d][a-z\d-]{0,38}$/i.test(site.githubUsername)
  )
    fail("githubUsername", "仅填写 GitHub 用户名，不要填写网址或 @。");
  let repo = site.repository;
  if (typeof repo !== "string")
    fail("repository", "请填写 用户名/仓库名 或 GitHub HTTPS 仓库地址。");
  if (repo.startsWith("https://")) {
    let url;
    try {
      url = new URL(repo);
    } catch {
      fail("repository", "仓库地址格式不正确。");
    }
    if (url.hostname !== "github.com" || url.username || url.password || url.port)
      fail("repository", "请填写 github.com 的仓库地址。");
    repo = url.pathname.replace(/^\/+|\/+$/g, "");
  }
  repo = repo.replace(/\.git$/, "");
  if (!/^[a-z\d][a-z\d-]{0,38}\/[a-z\d_.-]+$/i.test(repo))
    fail("repository", "请填写 用户名/仓库名 或 GitHub HTTPS 仓库地址。");
  site.repository = repo;
  site.title ??= {
    zh: `${localize(site.profile.name, "zh")} · 个人学术主页`,
    en: `${localize(site.profile.name, "en")} · Academic Homepage`,
  };
  site.description ??= "";
  for (const field of ["title", "description"]) {
    const value = site[field];
    if (
      !(
        typeof value === "string" ||
        (value &&
          typeof value === "object" &&
          typeof value.zh === "string" &&
          typeof value.en === "string")
      )
    )
      fail(field, '请填写文本或 {"zh": "中文", "en": "English"}。');
  }
  if (!localize(site.title, site.defaultLanguage).trim()) fail("title", "页面标题不能留空。");
  site.favicon ??= "assets/favicon.svg";
  if (typeof site.favicon !== "string" || !site.favicon) fail("favicon", "请填写图片路径。");
  return site;
}

export async function loadSiteConfig(filename = configFile) {
  return normalizeConfig(parseJSONC(await readFile(filename, "utf8"), String(filename)));
}

export async function loadGitHubSnapshot(
  site,
  filename = new URL("../data/github.json", import.meta.url),
) {
  let snapshot;
  try {
    snapshot = JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (snapshot?.username?.toLowerCase() === site.githubUsername.toLowerCase()) return snapshot;
  // A new account must never inherit another person's contribution history.
  return {
    username: site.githubUsername,
    status: "pending",
    updatedAt: null,
    mergedTotal: 0,
    repositoriesTotal: 0,
    mergedPRs: [],
    calendars: [],
    truncated: false,
  };
}
