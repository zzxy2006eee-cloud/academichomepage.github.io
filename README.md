# Academic Homepage

[中文](#中文说明) · [English](#english)

## 中文说明

### 从这里开始：只改一个配置文件

打开根目录的 **[`config.jsonc`](config.jsonc)** 修改主页内容。文件里按栏目写有中文注释；日常修改资料不需要编辑 HTML 或 JavaScript。

**最简单的线上修改方式：**

1. 打开仓库中的 [`config.jsonc`](config.jsonc)，点击铅笔编辑。
2. 修改对应字段的双引号内文字，保留其余配置。
3. 点击 **Commit changes**，提交到 `main`。
4. 等待 **Actions → Sync contributions and deploy homepage** 成功，刷新主页即可。无需手动构建或上传 `dist/`。

本地编辑则运行 `node scripts/dev.mjs`，保存配置后浏览器自动刷新；**本地保存不会直接改动线上网站**，仍需 `git commit`、`git push`。

下面是配置文件开头的常用字段示例（只修改对应字段，不要用此片段覆盖整个文件）：

```jsonc
{
  // 标签页标题；可以分别填写中文和英文，也可以直接填写一个字符串
  "title": { "zh": "你的姓名 · 个人学术主页", "en": "Your Name · Academic Homepage" },
  // 网页描述 / 搜索摘要。右侧可见的“关于我”正文请修改 about
  "description": { "zh": "我的研究与项目主页", "en": "My research and projects" },
  "repository": "your-username/academichomepage.github.io",
  "githubUsername": "your-username",
  "defaultLanguage": "zh",
  "favicon": "assets/favicon.svg"
}
```

| 常用字段 | 修改后的效果 |
| --- | --- |
| `title` | 浏览器标签页标题，初始 HTML 和中英文切换同步更新 |
| `description` | 网页描述与搜索摘要，初始 HTML 和中英文切换同步更新；搜索引擎刷新摘要可能有延迟 |
| `repository` | 页脚源码仓库链接，支持 `用户名/仓库名` 或完整 GitHub HTTPS 地址；不会创建、重命名仓库或改变部署域名 |
| `githubUsername` | GitHub 账号链接和贡献数据来源；新账号同步完成前显示等待状态，不展示旧账号的数据 |
| `defaultLanguage` | 首次访问的默认语言 `zh` / `en` |
| `favicon` | 浏览器小图标图片路径 |
| `profile` | 头像、姓名、学校、国家、邮箱等资料 |
| `about` / `interests` / `skills` | 关于我、研究方向、技能 |
| `education` / `awards` / `publications` / `projects` | 教育、奖项、论文、项目列表 |

### 使用说明目录

- [快速查找：页面内容在哪里修改](#快速查找页面内容在哪里修改)
- [第一次替换成自己的资料](#第一次替换成自己的资料)
- [个人资料与头像](#个人资料与头像)
- [About Me、近况、研究方向与技能](#about-me近况研究方向与技能)
- [教育背景与荣誉奖项](#教育背景与荣誉奖项)
- [论文成果](#论文成果)
- [核心项目与封面图片](#核心项目与封面图片)
- [中英文切换](#中英文切换)
- [GitHub 贡献与热力图](#github-贡献与热力图)
- [配色、布局与栏目标题](#配色布局与栏目标题)
- [修改后的预览与发布](#修改后的预览与发布)
- [常见问题](#常见问题)

### 本地运行

安装 Node.js 20 或更高版本，无需 `npm install`。

```sh
node scripts/dev.mjs
```

打开 http://127.0.0.1:4173 。保存 `config.jsonc`、`src/`、`assets/` 或贡献快照后会自动构建并刷新。配置写错时终端会显示错误，原页面保持不变；修正并保存后会继续更新。按 Ctrl+C 停止预览。

此命令只需要 Node.js，不依赖 npm。若已安装 npm，也可使用 `npm run dev`。普通静态预览仍可运行 `node scripts/build.mjs` 后执行 `node scripts/serve.mjs`，但该模式需要手动重新构建。

### 快速查找：页面内容在哪里修改

**日常改资料主要只需要修改 [`config.jsonc`](config.jsonc)，更换图片则放到 [`assets/images/`](assets/images/)。** 下表中的配置字段均位于 `config.jsonc`，除非单独标注了文件。

`profile.name` 表示在 `profile` 对象里找到 `name`；`projects[]` 表示项目列表中的每一项。

| 页面位置 / 想修改的内容 | 对应字段或文件 | 说明 |
| --- | --- | --- |
| 浏览器标题 | `title` | 支持双语文本或通用字符串 |
| 网页描述 / 搜索摘要 | `description` | 不同于项目中的 `projects[].description` |
| 头像 | `profile.avatar` + `assets/images/avatar.png` | 同名覆盖图片，或修改图片路径 |
| 头像下方姓名 | `profile.name.zh` | 侧栏始终展示中文姓名；`profile.name.en` 用于英文页脚等位置；浏览器标题单独由 `title` 控制 |
| 姓名下面一行英文 | `profile.romanized` | 可填写拼音、英文名或个人副标题 |
| 姓名下方学校、基本信息中的学校 | `profile.institution` | 两处共用同一双语字段 |
| 基本信息中的国家 | `profile.location` | 填写国家或所在地，支持中英文 |
| 基本信息中的邮箱 | `profile.email` | 只填邮箱地址，不加 `mailto:` |
| 基本信息中的 GitHub 账号名 | `githubUsername` | 同时决定主页链接与贡献数据来源 |
| 侧栏最近更新日期 | `profile.updated` | 手动维护，例如 `2026-11-09` |
| 右侧 About Me 正文 | `about[]` | 每一项对应一个段落 |
| About Me 下方近况 | `news.date`、`news.text` | 日期与一句话近况 |
| 研究方向 | `interests[]` | 按列表顺序展示 |
| 专业技能 | `skills[].title`、`skills[].items` | 按顺序展示标签；`title` 留空时隐藏分组标题 |
| 教育背景 | `education[]` | 起止时间、学校、学位、专业 |
| 荣誉与奖项 | `awards[]` | 奖项、级别 / 授予单位、年份 |
| 论文成果 | `publications[]` | 标题、作者、发表状态、PDF、代码和引用 |
| 核心项目 | `projects[]` | 封面、介绍、研究、职责、成果、链接 |
| GitHub 个人主页和贡献来源 | `githubUsername` | 仅填用户名，如 `your-username` |
| 页脚 `Open source` | 顶层 `repository` | 本主页的源码仓库：`用户名/仓库名` 或完整 GitHub HTTPS 网址 |
| 上游贡献的人工说明 | `contributionOverrides` | 按 `owner/repo` 配置中英文说明 |
| 默认语言 | `defaultLanguage` | `zh` 或 `en` |
| “示例资料”提示 | `demo` | 替换完真实内容后设为 `false` |
| 部分资料仍为示例时的提示 | `demoNote`、`demoLabel` | 分别控制简介下方说明与页脚的简短标记；`demoNote` 设为 `null` 可单独隐藏简介提示 |
| 配色、字号、间距、栏宽 | [`src/styles.css`](src/styles.css) | 在编辑器中搜索对应 CSS 名称 |
| 栏目标题、图标、导航文字 | [`src/app.js`](src/app.js) 的 `sections` | 正文栏目顺序另见下文 |
| 网页图标 | `favicon` | 图片放入 `assets/`，再填写路径 |
| 自动同步时间 | [`.github/workflows/pages.yml`](.github/workflows/pages.yml) 的 `schedule` | Cron 使用 UTC 时间 |

### 第一次替换成自己的资料

1. 修改 `profile` 中的姓名、学校、邮箱等信息，并将 `profile.avatar` 指向自己的头像。
2. 将 `about`、`interests`、`skills` 改成自己的介绍。
3. 替换 `education`、`awards`、`publications`、`projects` 中的示例条目。没有对应内容时，可以暂时把列表改成 `[]`；栏目标题仍会保留。
4. 填写真实的论文、仓库、简历链接，补齐中英文内容。
5. 确认示例履历已全部替换或删除，再将顶层 `"demo": true` 改为 `"demo": false`，并更新 `profile.updated`。
6. 按[修改后的预览与发布](#修改后的预览与发布)检查并推送。

### 配置文件的基本写法

大部分文本采用以下双语格式：

```json
{ "zh": "中文内容", "en": "English content" }
```

列表中新增一项时，可以复制现有对象，再替换字段。教育、奖项、论文和项目按配置中的顺序展示，不会自动按年份排序；把想优先展示的条目放在前面。

配置使用 JSONC：英文双引号、英文逗号，支持 `//` 单行注释、`/* ... */` 块注释和末尾逗号。程序不会执行配置里的代码。保存为 UTF-8，网页资源路径使用 `/`，不要填写 `D:\...` 这样的本机路径。

### 个人资料与头像

在 `profile` 中编辑。比如：

```json
{
  "name": { "zh": "张三", "en": "San Zhang" },
  "initials": "ZS",
  "romanized": "San Zhang",
  "handle": "@your-username",
  "avatar": "assets/images/avatar.png",
  "email": "yourname@example.com",
  "cvUrl": "assets/files/cv.pdf"
}
```

这是部分字段示例，只替换 `profile` 中对应的字段，保留其他字段。

- **更换头像**：直接用新图片覆盖 `assets/images/avatar.png`。如果换成 JPG，例如 `assets/images/my-avatar.jpg`，同时修改 `profile.avatar`。建议使用正方形图片，页面会按圆形框裁切显示。更换头像后，可在 `src/app.js` 的 `sidebar()` 中同步修改图片的替代文本。
- **侧栏顺序**：最上方直接显示头像，下方依次为中文姓名、英文姓名、学校；基本信息依次为学校、国家、邮箱、GitHub 账号名，之后是研究方向和专业技能。
- **邮箱**：填写 `profile.email` 后，点击邮箱会打开邮件应用。
- **保留字段**：`initials`、`handle`、`role`、`status`、`lab`、`nationality`、`cvUrl`、`scholarUrl`、`orcidUrl` 暂不在精简侧栏显示。需要恢复额外入口时修改 `src/app.js` 的 `sidebar()`。底部的“导出 PDF 简历”会根据主页配置生成简历，不使用 `cvUrl` 文件。
- **日期**：`profile.updated` 是你维护资料的日期，不会自动改变；热力图下方的同步时间由程序单独更新。

### About Me、近况、研究方向与技能

`about` 是段落列表。下面的写法会显示两段介绍：

```json
"about": [
  { "zh": "你好，我是张三，目前就读于……", "en": "Hello, I am San Zhang, currently studying at…" },
  { "zh": "我的研究关注……", "en": "My research focuses on…" }
]
```

`about` 内容按普通文本显示，不会解析 Markdown 或 HTML。想换段请新增列表项。

`news` 控制简介下面的一行近况：

```json
"news": {
  "date": "2026.11",
  "text": { "zh": "发布了一个新的开源项目。", "en": "Released a new open-source project." }
}
```

不想展示近况时，可设置 `"news": null`。将 `demoNote` 设为 `null` 可隐藏简介下方的示例提示。`interests` 中的每项对应一个研究方向；`skills` 的每项对应一个技能分组：

```json
{
  "title": "",
  "items": ["Python", "PyTorch", "C++"]
}
```

### 教育背景与荣誉奖项

在 `education` 列表里复制已有对象，填写：

| 字段 | 含义 |
| --- | --- |
| `period` | 起止时间，例如 `2023 — 至今`，支持中英文对象 |
| `school` | 学校名称 |
| `logo` | 可选校徽图片路径；将图片放入 `assets/images/` 后填写路径，留空不显示 |
| `degree` | 学位或阶段，例如本科、硕士、博士 |
| `detail` | 专业、学院、实验室或补充说明 |

在 `awards` 列表里填写 `title`（奖项名称）、`organization`（级别与授予单位）、`year`（年份）。日期、学位和奖项不会自动从其他平台获取，需要自行维护。

### 论文成果

每篇论文对应 `publications` 中的一个对象。复制已有条目后，修改以下字段：

| 字段 | 页面作用 |
| --- | --- |
| `id` | 内部标识，例如 `my-paper-2026`；同一个列表中不能重复 |
| `year` | 左侧年份 |
| `title` | 论文标题；可直接使用英文字符串，也可提供中英文对象 |
| `authors` | 作者姓名列表，按实际作者顺序填写 |
| `highlightAuthor` | 要加粗并加下划线的姓名，必须与 `authors` 中的文字完全一致 |
| `role` | 如“共同一作”；没有则设为 `""` |
| `status` | 如“已发表”“已接收”“预印本” |
| `venue` | 会议、期刊、年份等发表信息 |
| `pdf` | PDF 网址或本项目文件路径 |
| `code` | 该论文的代码仓库完整网址 |
| `bibtex` | 点击 BibTeX 后展示并可复制的引用文本 |

可以把论文 PDF 放到 `assets/papers/my-paper.pdf`，然后设置 `"pdf": "assets/papers/my-paper.pdf"`。`pdf` 或 `code` 留空时，按钮显示为未配置状态；`bibtex` 留空时不显示引用入口。

在 JSON 字符串中，用 `\n` 表示 BibTeX 换行，例如：

```json
"bibtex": "@article{myPaper2026,\n  title={My Paper Title},\n  author={Zhang, San},\n  year={2026}\n}"
```

### 核心项目与封面图片

每张项目卡片对应 `projects` 中的一项：

| 字段 | 页面位置 / 行为 |
| --- | --- |
| `id` | 唯一项目标识，用于打开正确的详情弹窗 |
| `title` | 项目名称 |
| `cover` | 封面图片的相对路径 |
| `description` | 名称下面的一句话介绍 |
| `research` | “研究”一行，例如 RAG、LLM 或具体问题 |
| `role` | “职责”一行，说明自己负责什么 |
| `outcome` | “成果”一行，填写真实产出 |
| `tags` | 技术或研究方向标签列表 |
| `repository` | **该项目**的 GitHub 仓库完整网址 |
| `demo` | 在线演示地址；留空则隐藏 Demo 入口 |
| `details` | “项目详情”弹窗中的详细介绍，按普通文本显示 |

例如把新封面放到 `assets/images/my-project.png`，然后在对应项目里修改：

```json
"cover": "assets/images/my-project.png",
"repository": "https://github.com/your-username/your-project",
"tags": ["LLM", "RAG", { "zh": "知识图谱", "en": "Knowledge graphs" }]
```

封面支持 SVG、PNG、JPG、WebP。卡片展示区域比例约 `1.85:1`；页面与详情弹窗使用 `object-fit: contain`，完整展示设备，周围保留浅色留白。

构建时会自动为头像、封面、配置脚本和样式等资源添加内容版本号；日常仍只需修改源文件，版本号无需手动维护。如果刚发布后仍看到旧内容，可按 `Ctrl + F5` 强制刷新页面入口（GitHub Pages 的入口 HTML 也可能暂时被缓存）。

配置项目 `repository` 后，**封面、标题和 GitHub 按钮**都会跳转到该仓库；“项目详情”仍打开本页弹窗。仓库留空时，封面和标题打开详情，仓库按钮禁用。

研究、职责、成果中某项不需要展示时，可将对应字段设为 `""`，页面将隐藏这一行。更换封面可以同名覆盖图片，也可以修改 `projects[].cover` 指向新图片。

注意两个同名字段的区别：顶层 `repository` 是**主页自身的源码仓库**，支持 `用户名/仓库名` 或完整 GitHub HTTPS 网址；`projects[].repository` 是**每个展示项目的地址**，需要完整 `https://github.com/...`。顶层 `demo` 是布尔值，控制示例提示；项目里的 `demo` 是演示链接字符串。

### 中英文切换

- `defaultLanguage` 决定首次访问的默认语言，填写 `"zh"` 或 `"en"`。
- 中文和英文由你分别维护，不会自动翻译。通用专有名词如 `Python` 可以只用字符串，两种界面会显示相同文本。
- 已选择过的语言保存在浏览器中，因此更改默认语言后，老访客仍会看到之前选择的语言。可以点击页面语言按钮，或使用无痕窗口检查首次访问效果。
- 内容翻译在 `config.jsonc`；按钮、空状态等界面文字在 `src/app.js` 的 `w("中文", "English")` 中；栏目标题与导航在 `sections` 中。
- 当前正式支持中文、英文两种语言；增加第三种语言需要修改渲染逻辑，不能只增加一个 JSON 字段。

### GitHub 贡献与热力图

`githubUsername` 决定贡献数据来源、侧栏 GitHub 账号名与链接和“全部仓库”入口。`profile.handle` 是保留字段，当前不显示。

贡献表统计公开、已合并、且仓库拥有者不是当前账号的 PR。没有符合条件的 PR 时会显示空状态，不需要手工添加假的统计数字。表格默认展示最近有合并记录的 6 个仓库；每个仓库最多展示 2 条 PR 标题和 3 个合并链接，完整记录可通过详情或 GitHub 搜索入口查看。

如果希望把自动取得的 PR 标题改写成更清楚的中英文介绍，编辑 `contributionOverrides`：

```json
"contributionOverrides": {
  "owner/repository": {
    "zh": "修复依赖解析并补充回归测试。",
    "en": "Fixed dependency resolution and added regression tests."
  }
}
```

键名必须与 GitHub 的 `owner/repository` 完全对应。该配置只覆盖**已查询到的仓库**的介绍，不会新增贡献行、修改 PR 数量或伪造合并记录。

- **热力图数据**：`scripts/sync-github.mjs` 从 `user(login: githubUsername).contributionsCollection` 获取真实贡献日历。默认使用 GitHub 个人主页相同的近一年查询口径，另外提供今年和去年；选择器显示“近一年”及具体年份。日历与图例使用 GitHub 风格的绿色梯度，日期和贡献数量来自 GitHub。
- **同步时间**：在 `.github/workflows/pages.yml` 中修改 `schedule` 下的 Cron。当前 `17 2 * * *` 为 UTC 02:17，即北京时间每天 10:17。它不是实时推送，GitHub 调度也可能延迟。
- **立即更新**：在仓库 Actions 中选择 `Sync contributions and deploy homepage`，点击 `Run workflow`，选择 `main` 并运行。无需为了刷新数据修改个人介绍。
- **改统计规则或增加历史年份**：编辑 `scripts/sync-github.mjs`。当前范围列表是 `["last-year", year, year - 1]`，其中 `last-year` 使用 GitHub 默认的近一年范围。
- **改表格显示条数**：编辑 `src/app.js` 的 `contributions()`，其中 `.slice(0, 6)` 控制仓库数量，另外的 `.slice(0, 2)`、`.slice(0, 3)` 控制介绍和合并链接数量。
- **不要手工改 `data/github.json` 来维护介绍**：它是同步快照，会被自动数据替换。人工说明请写在 `contributionOverrides`。

### 导出 PDF 简历

1. 选择主页语言，滚动到左侧栏最下方，点击 **导出 PDF 简历 / Export Resume PDF**。手机端先点击导航中的“个人资料 / Profile”展开侧栏。
2. 在浏览器打印窗口选择 **另存为 PDF**，纸张选择 **A4**，建议使用默认缩放，并关闭浏览器的“页眉和页脚”，然后保存。快捷键 `Ctrl+P` 也会使用相同的简历版式。
3. 简历按单列小节排版，包含个人联系方式、教育背景、研究方向、技能、荣誉及核心项目；不包含贡献统计、热力图、网站导航或项目封面。

项目自动读取 `projects[]` 中的 `title`（名称）、`description`（简介）和 `outcome`（成果），逐项纵向排列；标题保留仓库链接。修改这些配置后，主页和简历内容会一起更新，无需维护两份资料。

`resume.includePublications` 控制是否在简历中加入论文：设为 `false` 排除论文，替换为真实论文后可设为 `true`。未填写该设置时，`demo: true` 默认不导出论文，`demo: false` 默认导出。此设置不会隐藏主页的论文栏目。

简历模板在 `src/app.js` 的 `renderResume()`，打印排版在 `src/styles.css` 的 `@media print`。它是独立于主页双栏布局的简历视图；内容较多时会自动分页。导出只在本地浏览器中完成，不上传资料到第三方转换服务。

### 配色、布局与栏目标题

这些修改位于 [`src/styles.css`](src/styles.css)，通常不需要碰 `config.jsonc`。

| 想修改的效果 | 在 CSS 中搜索 | 说明 |
| --- | --- | --- |
| 主要文字和链接色 | `:root` 下的 `--ink`、`--blue`、`--blue-dark` | 修改相应十六进制颜色 |
| 深色侧栏 | `.sidebar` 的 `background` | 当前是两个蓝灰色组成的渐变；只改 `--sidebar` 不会改变该渐变 |
| 字体 | `:root` 下的 `--font` | 使用字体回退列表，不依赖外部字体服务 |
| 主页最大宽度 | `.site-shell` 的 `max-width` | 同名规则有后续覆盖，桌面默认最终值为 `1320px` |
| 左栏宽度 | `.site-shell` 的 `grid-template-columns` | 桌面默认 `300px minmax(0, 1fr)`，不同屏宽有覆盖规则 |
| 头像大小与圆角 | `.profile-avatar` | 手机端也有单独的覆盖规则 |
| 头像与姓名对齐 | `.profile-head`、`.profile-avatar` | 桌面端沿侧栏竖直中线居中；手机端保留头像与姓名并排布局 |
| 正文边距 | `.content` | 调整内边距 `padding` |
| 栏目间距 | `.content-section` | 调整 `margin-top` |
| 项目卡片数量 / 间距 | `.project-grid` | 桌面两列，手机一列 |
| 封面裁切比例 | `.project-cover` | 修改 `aspect-ratio` 和 `object-fit` |
| 贡献图颜色 | `.heat-cell[data-level=...]`、`.legend-cell[data-level=...]` | 日历和图例应一起修改 |
| 手机适配 | `@media (max-width: 760px)` | 760px 及以下切换为单列 |
| 导出 PDF 的样式 | `@media print` | 打印专用布局 |

**独立滚动的关键**：桌面端 `body` 禁止整体滚动，`.sidebar` 和 `.main-pane` 分别设置 `height: 100dvh`、`overflow-y: auto`。要保留左右独立操控，避免把它们改回由整个页面统一滚动。手机端有意改为单列页面滚动。

栏目名称、英文副标题和小图标在 `src/app.js` 的 `sections` 数组中，顺序为：内部 ID、中文导航、英文导航、中文栏目标题、英文副标题、图标。比如教育栏的 ID 是 `education`，图标是 `🎓`。

`sections` 决定导航顺序；**正文顺序**还需要在 `render()` 返回的 HTML 中调整相应 `<section>` 块。只调整数组不会移动正文栏目。删除或新增栏目时，需要同时维护 `sections`、对应渲染函数和 `render()`，保持导航 ID 与正文 ID 一致。

### 修改后的预览与发布

在 Windows PowerShell 中进入下载或克隆的项目目录（按实际位置调整路径）：

```powershell
Set-Location -LiteralPath '.\academic-homepage'
node scripts/check.mjs
node scripts/dev.mjs
```

打开 [本地预览](http://127.0.0.1:4173)，检查中文、英文和手机宽度。`check.mjs` 会检查配置格式、双语必填项、图片是否存在、项目 / 论文 ID、账号快照与脚本语法。`node scripts/dev.mjs` 会自动重新读取配置、构建和刷新浏览器，错误时在终端提示。只需生成发布文件时执行 `node scripts/build.mjs`。

确认无误后，在项目目录提交并推送：

```powershell
git status
git add config.jsonc assets/images
git commit -m "Update homepage content"
git push origin main
```

上述 `git add` 适用于文字和图片修改；若同时修改了 `src/styles.css`、`assets/files/` 等文件，也要将实际修改的路径加入暂存。之后在仓库 Actions 查看最新工作流，`deploy` 成功后打开仓库 **Settings → Pages** 中显示的网站地址。

也可以直接在 GitHub 网页打开 `config.jsonc`，使用编辑按钮保存并提交；图片通过仓库的文件上传入口放到相应目录。提交到 `main` 后同样会自动部署。

**修改源文件，不要编辑 `dist/`。** `dist/` 是构建产物，重新构建会覆盖内容，而且不会提交到 Git。

### 常见问题

| 现象 | 应检查的位置 |
| --- | --- |
| 修改后本地页面没变化 | 使用 `node scripts/dev.mjs` 自动更新；若用 `node scripts/serve.mjs`，需先重新构建。检查终端是否有配置错误 |
| 本地有变化，线上没有 | 是否推送到 `main`，最新 Actions 是否成功；然后尝试强制刷新 |
| 图片在本机正常，线上不显示 | 检查文件名大小写、相对路径与是否提交图片；不要使用 Windows 绝对路径 |
| GitHub / PDF 按钮是灰色的 | 对应项目的 `repository` 或论文的 `pdf` / `code` 仍为空 |
| 改完名字，论文作者仍未变化 | 论文的 `authors`、`highlightAuthor`、`bibtex` 都需要分别更新 |
| 改成英文默认，但仍显示中文 | 浏览器记住了之前选择的语言；点击 EN 或用无痕窗口查看 |
| 页面仍提示“示例资料” | 确认示例全部替换后，将顶层 `demo` 改为 `false` |
| 无法隐藏某个空栏目 | 空列表只清空条目；完整隐藏需要同时修改 `sections` 和 `render()` |
| 有提交活动，但上游 PR 表为空 | 热力图和上游合并 PR 口径不同；自己仓库的提交不等于贡献给其他仓库的已合并 PR |
| 热力图没有马上更新 | 查看最后同步时间，可手动运行工作流；GitHub 自身统计也可能延迟 |
| 更换 GitHub 账号后热力图为空 | 新账号同步前显示等待状态；提交后 Actions 自动同步，或手动运行工作流 |
| 配置无法解析 | 检查英文双引号、逗号和括号；JSONC 允许注释，运行 `node scripts/check.mjs` 查看具体错误 |
| 直接双击 `index.html` 内容不出现 | 使用构建和本地预览命令；源目录的运行数据文件由构建生成到 `dist/data/` |

### GitHub Pages

1. 将源码推送到仓库 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 工作流 `.github/workflows/pages.yml` 自动完成同步、校验、构建和发布。
4. 新增内容后提交并推送即可更新网站，不需要提交 `dist/`。

仓库名 `academichomepage.github.io` 是项目仓库，因此地址是 `https://用户名.github.io/academichomepage.github.io/`。如果希望地址为 `https://用户名.github.io/`，仓库必须命名为 `用户名.github.io`。本项目使用相对资源路径，支持两种部署形式。

### 贡献数据

`scripts/sync-github.mjs` 通过 GitHub GraphQL 获取近一年、今年与去年的日历，通过 REST Search 获取公开、已合并且不属于当前账号名下仓库的 PR。表格中的描述默认取 PR 标题，可以通过 `contributionOverrides` 精编中英文说明。日期范围与同步时间会显示在界面上；自动同步不等于与 GitHub 页面实时一致。

Actions 使用内置 `GITHUB_TOKEN`，无需将 Token 写进源码。手动同步时，将 Token 设置为当前进程环境变量 `GITHUB_TOKEN` 后运行 `node scripts/sync-github.mjs`。**不要提交 Token 或 `.env` 文件。** 搜索最多保留最近 1,000 条记录；超出后会明确显示截断提示。热力图统计的是 GitHub 返回的贡献活动，和「已合并上游 PR」不是同一种口径。

同步数据只进入部署产物和 Actions 缓存，不会每天自动修改源代码。源码附带首次同步快照，API 暂不可用时仍可展示已有数据。更换账号后应重新同步；缓存中的账号不匹配时，构建会输出新账号的等待状态，不会展示旧账号的数据，也不会阻塞其他资料发布。

### 文件结构

```text
config.jsonc             # 唯一主页配置：中文注释、双语元数据和全部资料
data/github.json         # 首次公开 GitHub 数据快照
assets/images/           # 头像及项目封面
src/app.js               # 渲染与交互
src/styles.css           # 配色、布局、响应式和打印样式
scripts/                 # 构建、同步、预览、校验
.github/workflows/       # 每日同步和 GitHub Pages 部署
docs/                    # 辅助文档与素材说明
```

## English

1. Edit [`config.jsonc`](config.jsonc). It supports comments, trailing commas, and bilingual values such as `{ "zh": "中文", "en": "English" }`.
2. Set `title`, `description`, `repository`, and `githubUsername`, then update `profile`, `about`, `interests`, `skills`, `education`, `awards`, `publications`, and `projects`.
3. Put images in `assets/images/` and use relative paths in the configuration. `repository` controls the homepage's source link; `projects[].repository` controls each project link.
4. With Node.js 20+, run `node scripts/dev.mjs` and open `http://127.0.0.1:4173`. Saving configuration or assets rebuilds the site and refreshes the browser. No dependency installation is needed.
5. Run `node scripts/check.mjs` to validate content. Use `node --test tests/config.test.mjs` to check configuration and preview behavior.
6. Commit and push changes to `main`. Enable **GitHub Actions** in **Settings → Pages** and wait for deployment to succeed. Local edits alone do not update the public site.

`defaultLanguage` selects the language for first-time visitors; returning visitors retain their saved preference. Supply both translations yourself. `description` controls page metadata; use `about` for the visible introduction.

For manual static builds, run `node scripts/build.mjs`, then `node scripts/serve.mjs`. Do not edit or commit `dist/`.

GitHub Actions refreshes contribution data on pushes, manual workflow runs, and the configured daily schedule. Change `githubUsername` to use your account. If a snapshot belongs to another account, the site displays a pending state until synchronization succeeds. Keep tokens out of the configuration and source files.

## 素材替换与许可

复用主页时，请替换头像、项目封面和校徽，并同步修改相应配置路径。代码许可见 [LICENSE](LICENSE)，附带素材的来源及许可范围见 [素材说明](docs/ASSETS.md)。
