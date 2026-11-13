/** Only public PR metadata is persisted. Credentials are read from the environment. */
import { writeFile } from "node:fs/promises";
import { loadSiteConfig } from "./config.mjs";
const config = await loadSiteConfig();
const username = config.githubUsername;
if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(username))
  throw new Error("Invalid githubUsername in config.jsonc");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.log("No GITHUB_TOKEN: preserving the existing GitHub snapshot.");
  process.exit(0);
}
async function request(url, body) {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "academic-homepage",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`GitHub request failed (${response.status}) at ${new URL(url).pathname}`);
  const result = await response.json();
  if (result.errors)
    throw new Error(
      "GitHub GraphQL request failed: " + result.errors.map((e) => e.message).join("; "),
    );
  return result;
}
const now = new Date();
const year = now.getUTCFullYear();
const levels = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};
const calendars = [];
for (const y of ["last-year", year, year - 1]) {
  // Omit the dates for GitHub's default rolling-year profile calendar.
  const from = y === "last-year" ? undefined : `${y}-01-01T00:00:00Z`,
    to = y === "last-year" ? undefined : y === year ? now.toISOString() : `${y}-12-31T23:59:59Z`;
  const query =
    "query($login:String!,$from:DateTime,$to:DateTime){user(login:$login){contributionsCollection(from:$from,to:$to){startedAt endedAt contributionCalendar{totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}";
  const r = await request("https://api.github.com/graphql", {
    query,
    variables: { login: username, from, to },
  });
  if (!r.data?.user) throw new Error("GitHub account not found");
  const collection = r.data.user.contributionsCollection;
  const calendar = collection.contributionCalendar;
  calendars.push({
    year: y,
    from: collection.startedAt,
    to: collection.endedAt,
    total: calendar.totalContributions,
    weeks: calendar.weeks
      .map((w) => ({
        days: w.contributionDays
          .filter((d) => y === "last-year" || d.date.startsWith(String(y)))
          .map((d) => ({
            date: d.date,
            weekday: d.weekday,
            count: d.contributionCount,
            level: levels[d.contributionLevel] ?? 0,
          })),
      }))
      .filter((w) => w.days.length),
  });
}
const mergedPRs = [];
let total = 0,
  incomplete = false;
for (let page = 1; page <= 10; page++) {
  const query = `is:pr is:merged is:public author:${username} -user:${username}`;
  const url =
    "https://api.github.com/search/issues?" +
    new URLSearchParams({
      q: query,
      sort: "updated",
      order: "desc",
      per_page: "100",
      page: String(page),
    });
  const r = await request(url);
  total = r.total_count;
  incomplete ||= r.incomplete_results;
  for (const pr of r.items) {
    const repo = pr.repository_url.replace("https://api.github.com/repos/", "");
    if (repo.split("/")[0].toLowerCase() === username.toLowerCase()) continue;
    if (!pr.pull_request?.merged_at) continue;
    mergedPRs.push({
      repository: repo,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      mergedAt: pr.pull_request.merged_at,
    });
  }
  if (page * 100 >= Math.min(total, 1000)) break;
}
if (incomplete)
  throw new Error("GitHub search was incomplete; the previous complete snapshot is preserved.");
mergedPRs.sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
const result = {
  username,
  updatedAt: now.toISOString(),
  status: "ready",
  mergedTotal: total,
  repositoriesTotal: new Set(mergedPRs.map((pr) => pr.repository)).size,
  truncated: total > mergedPRs.length,
  mergedPRs,
  calendars,
};
await writeFile(
  new URL("../data/github.json", import.meta.url),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `Synced ${username}: ${mergedPRs.length} public upstream PRs, ${calendars.length} contribution calendars.`,
);
