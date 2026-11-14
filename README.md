# Academic Homepage

支持中英文切换、GitHub 贡献展示和 PDF 简历导出的个人主页。日常资料集中在 [`config.jsonc`](config.jsonc) 中修改。

## 快速修改并发布

1. 在 GitHub 打开 [`config.jsonc`](config.jsonc)，点击铅笔按钮修改对应内容。
2. 点击 **Commit changes**，提交到 `main` 分支。
3. 等待 **Actions → Sync contributions and deploy homepage** 成功，刷新主页。

首次部署：在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。只修改配置中的 `repository` 不会改变网站地址。

## 常用内容在哪里改

以下字段均位于 `config.jsonc`：

| 内容 | 字段 |
| --- | --- |
| 页面标题、描述、源码仓库 | `title`、`description`、`repository` |
| GitHub 账号及贡献来源 | `githubUsername` |
| 头像、姓名、学校、邮箱 | `profile` |
| 关于我、研究方向、专业技能 | `about`、`interests`、`skills` |
| 教育、奖项、实习 | `education`、`awards`、`internships` |
| 论文、项目 | `publications`、`projects` |
| 首次访问的默认语言 | `defaultLanguage`：`zh` 或 `en` |

双语文字使用 `{ "zh": "中文内容", "en": "English content" }`，需要分别维护。图片放入 [`assets/images/`](assets/images/)，再修改头像或项目的图片路径；配色和间距在 [`src/styles.css`](src/styles.css) 中调整。

“项目详情”打开该项目的独立介绍页；流程图、硬件结构、演示视频及成果在 `projects[].detailPage` 中配置，见[详细说明](docs/USAGE.md#独立项目介绍页)。

## 本地预览

安装 **Node.js 20+**，在项目目录运行，无需安装依赖：

```sh
node scripts/check.mjs
node scripts/dev.mjs
```

打开 [本地预览](http://127.0.0.1:4173)，保存配置后自动刷新。按 `Ctrl+C` 停止。确认后提交并推送到 `main`，本地保存不会直接更新线上网站。不要编辑或提交构建目录 `dist/`。

## 导出 PDF 简历

点击左栏底部 **导出 PDF 简历**，在打印窗口选择 **另存为 PDF**、**A4**，关闭页眉和页脚。手机端先展开“个人资料”。

简历使用当前语言和配置，项目按“名称、简介、成果”纵向排列，不含热力图。实习有内容时自动加入；论文由 `resume.includePublications` 控制。

## 常见问题

- **线上没更新**：确认已推送且 Actions 成功，再按 `Ctrl+F5` 刷新。
- **热力图没立即变化**：贡献数据定时同步，也可在 Actions 手动运行工作流。
- **配置报错**：运行 `node scripts/check.mjs`；使用英文双引号、逗号，并保留括号结构。

复用时请替换个人资料和素材。代码许可见 [LICENSE](LICENSE)，素材许可见 [素材说明](docs/ASSETS.md)。

---

**[📖 查看详细使用说明](docs/USAGE.md)** · [English guide](docs/USAGE.md#english)

完整字段示例、实习填写、项目封面、双语配置、GitHub 同步、PDF 排版、部署及故障排查，均在详细版中。
