# Academic Homepage

[中文](#中文说明) · [English](#english)

A quiet, blue-and-white academic homepage with a graphite sidebar, independently scrollable columns, bilingual content, and public GitHub contribution records.

**Live:** https://zzxy2006eee-cloud.github.io/academichomepage.github.io/

![Desktop preview](docs/desktop-preview.png)

[Mobile preview](docs/mobile-preview.png)

## 中文说明

本项目为原创静态主页，参考 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) 的开源使用方式与内容组织，没有复制其代码。使用原生 HTML / CSS / JavaScript，无框架和第三方运行时依赖。

### 功能

- 桌面端左右两栏独立滚动；手机端为响应式单列，个人资料可展开。
- 中文 / English 全站切换，浏览器记住语言选择。
- About Me、教育背景、荣誉与奖项、论文成果、核心项目、开源贡献。
- 项目封面、研究内容、个人职责、项目成果、仓库链接及详情弹窗。
- 论文 BibTeX 预览和复制；可配置 PDF、Code 链接。
- 公开上游 PR 的「项目 / 具体贡献 / 合并记录」明细表，真实 GitHub 热力图。
- 每次推送、手动运行和每天北京时间 10:17 自动同步和部署。GitHub 定时工作流可能延迟；同步失败时保留已缓存的数据并显示原同步时间。
- 导出简历通过浏览器打印，可另存为 PDF；配置 `cvUrl` 后改为下载自己的简历。

### 本地运行

安装 Node.js 20 或更高版本，无需 `npm install`。

```sh
node scripts/check.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

打开 http://127.0.0.1:4173 。修改后重新执行 `node scripts/build.mjs` 并刷新页面。按 Ctrl+C 停止预览。

### 修改内容

所有个人文字在 [`data/site.json`](data/site.json)，大部分文本采用以下双语格式：

```json
{ "zh": "中文内容", "en": "English content" }
```

| 配置 | 用途 |
| --- | --- |
| `profile` | 姓名、机构、邮箱、头像、简历、Scholar、ORCID |
| `about` / `news` | 自我介绍与一行近况 |
| `education` / `awards` | 教育背景与荣誉 |
| `publications` | 论文、作者、状态、PDF、代码、BibTeX |
| `projects` | 封面、介绍、研究、职责、成果、仓库与 Demo |
| `interests` / `skills` | 研究兴趣与技能 |
| `githubUsername` | 贡献数据来源账号 |
| `contributionOverrides` | 按 `owner/repo` 自定义具体贡献的中英文介绍 |
| `demo` | 是否显示「履历为示例」提示，替换真实资料后再设为 `false` |

**当前姓名、学历、奖项、论文及项目仍为明确标注的示例，不是账号持有人的真实履历。** 头像使用用户提供的海边黑猫图片。GitHub 区域展示实际公开数据，不把参考截图里的他人 PR 当作个人贡献。

头像：`assets/images/avatar.png`。项目封面：`assets/images/knowledge.svg` 和 `agents.svg`；可替换为 PNG / JPG / WebP，然后修改项目 `cover` 路径。封面、标题和仓库按钮会在配置 `repository` 后跳转到相应 GitHub 项目。留空的 PDF / 仓库链接不会生成假链接。

修改贡献介绍的例子：

```json
"contributionOverrides": {
  "owner/repository": {
    "zh": "修复依赖解析并补充回归测试。",
    "en": "Fixed dependency resolution and added regression tests."
  }
}
```

### GitHub Pages

1. 将源码推送到仓库 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 工作流 `.github/workflows/pages.yml` 自动完成同步、校验、构建和发布。
4. 新增内容后提交并推送即可更新网站，不需要提交 `dist/`。

仓库名 `academichomepage.github.io` 是项目仓库，因此地址是 `https://用户名.github.io/academichomepage.github.io/`。如果希望地址为 `https://用户名.github.io/`，仓库必须命名为 `用户名.github.io`。本项目使用相对资源路径，支持两种部署形式。

### 贡献数据

`scripts/sync-github.mjs` 通过 GitHub GraphQL 获取今年与去年的日历，通过 REST Search 获取公开、已合并且不属于当前账号名下仓库的 PR。表格中的描述默认取 PR 标题，可以通过 `contributionOverrides` 精编中英文说明。日期范围与同步时间会显示在界面上。

Actions 使用内置 `GITHUB_TOKEN`，无需将 Token 写进源码。手动同步时，将 Token 设置为当前进程环境变量 `GITHUB_TOKEN` 后运行 `node scripts/sync-github.mjs`。**不要提交 Token 或 `.env` 文件。** 搜索最多保留最近 1,000 条记录；超出后会明确显示截断提示。热力图统计的是 GitHub 返回的贡献活动，和「已合并上游 PR」不是同一种口径。

同步数据只进入部署产物和 Actions 缓存，不会每天自动修改源代码。源码附带首次同步快照，API 暂不可用时仍可展示已有数据。更换账号后应重新同步；缓存中的账号不匹配时，构建校验会阻止展示旧账号的数据。

### 文件结构

```text
data/site.json           # 唯一主要内容配置
data/github.json         # 首次公开 GitHub 数据快照
assets/images/           # 头像及项目封面
src/app.js               # 渲染与交互
src/styles.css           # 配色、布局、响应式和打印样式
scripts/                 # 构建、同步、预览、校验
.github/workflows/       # 每日同步和 GitHub Pages 部署
docs/                    # 截图及维护说明
```

## English

This is an original, dependency-free academic homepage inspired by the content structure and open-source workflow of AcadHomepage. It does not reuse that project's implementation.

Run `node scripts/build.mjs` and `node scripts/serve.mjs` with Node.js 20+. Edit bilingual content in `data/site.json`, and put images in `assets/images/`. Desktop columns scroll independently. Mobile uses a single-column layout with expandable profile details. Language preference persists locally.

The biography, education, awards, papers, and projects are explicitly labeled examples. Replace them before disabling `demo`. The GitHub section uses real public account data: upstream merged PR descriptions and links, plus this year's and last year's contribution calendars. GitHub Actions refreshes the data and deploys on pushes, manual runs, and a daily schedule. Tokens are never included in the public website.

Enable **GitHub Actions** as the repository's Pages source. A project repository named `academichomepage.github.io` is served at `https://USERNAME.github.io/academichomepage.github.io/`.

## License

Source code and original SVG illustrations are MIT licensed. The user-supplied avatar is retained as a personal asset; replace it with your own image when reusing this template.
