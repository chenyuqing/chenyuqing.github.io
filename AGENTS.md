# AGENTS.md

## 技术栈

- Astro 6，`output: 'static'`（纯 SSG，无 SSR / 服务端路由）
- Node >= 22.12.0
- 推送 `main` 分支自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）

## 命令

```sh
npm run dev       # Astro 开发服务器
npm run build     # 生产构建 → dist/
npm run preview   # 预览构建结果
```

未配置 linter、typecheck 或测试命令。

## 架构

- **页面**：`src/pages/` — Astro 文件路由
- **布局**：`src/layouts/BaseLayout.astro`（含 header、footer、GA4、主题/语言切换、AI Agent 面板）
- **样式**：单文件 `src/styles/global.css`（无 CSS 框架，自定义设计系统）
- **内容集合**：`src/content.config.ts` — 两个独立 collection：
  - `blog` — `src/content/blog/*.md`，深度文章
  - `news` — `src/content/news/*.md`，快讯/短评
- **全站索引**：`src/pages/site-index/` — 构建时生成 JSON（blog-all / news-30d / news-90d），供 AI Agent 客户端检索
- **RSS**：`/rss.xml`（全站）、`/blog/rss.xml`、`/news/rss.xml`
- **静态资源**：`public/`（favicon、`media/blog/`、`media/news/`）
- **备份**：`backup/` 存放旧 Hexo 文章，不参与构建

## Blog schema

```yaml
title: string          # 必填
description: string    # 可选
cover: string          # 可选，/media/blog/xxx.png
pubDate: date          # 必填
updatedDate: date      # 可选
tags: string[]         # blog 独立 tag 体系
series: string         # 可选，系列名
lang: "zh" | "en"     # 可选，默认 zh
draft: boolean         # 默认 false
```

## News schema

```yaml
title: string          # 必填
link: string           # 可选，外部链接
description: string    # 可选，无则截取正文前 N 字
cover: string          # 可选，/media/news/xxx.png
pubDate: date          # 必填
tags: string[]         # news 独立 tag 体系
draft: boolean         # 默认 false
```

正文（Markdown body）可选。有正文 → 详情页展示完整内容；无正文 → 详情页展示 description + "阅读原文"链接。所有 news 条目先进站内详情页，不直接跳转外部链接。

## 新增博客文章

在 `src/content/blog/<slug>.md` 创建文件：

```yaml
---
title: "文章标题"
description: "一句摘要"
pubDate: 2026-05-14
tags: ["AI", "workflow"]
draft: false
---
```

## 新增动态

在 `src/content/news/<slug>.md` 创建文件：

```yaml
---
title: "OpenAI 发布 GPT-5"
link: "https://openai.com"
description: "一句话点评。"
pubDate: 2026-06-28
tags: ["产品发布", "大模型"]
draft: false
---
```

## 首页结构

Intro（一行定位 + 副标题 + 链接 + AI 问答提示）→ 最新文章（blog 3篇大卡片，cream）→ 最新动态（news 5条小卡片，最近14天，dark surface）→ Contact（橙色 callout）

## /blog/ 列表页

支持 tag 筛选。有 series 属性的文章出现系列分组入口。文章详情页含侧边 TOC、预计阅读时间、代码块复制按钮、系列导航。

## /news/ 列表页

支持 tag 筛选 + 翻页（每页 15 条）。详情页简洁布局，有外部链接时显示"阅读原文"按钮。

## About 页

三大区：人（头像+定位）→ 做（项目展示）→ 写（写作方向）

## AI Agent

- 右下角悬浮按钮 + 侧边抽屉对话面板
- 支持 OpenAI / Claude / OpenAI Compatible（DeepSeek、Groq、Ollama 等）
- 用户自配 API key + provider + model，设置存 localStorage
- 首版只做站内内容问答（客户端关键词检索 + LLM 生成回答）
- 全站索引构建时生成，按问题自动选加载 news-30d 或 news-90d

## 当前视觉系统

- 2026-06 之后的实现不再使用旧的“粗黑描边 + 硬阴影 + 卡通贴纸”作为全站 UI 主风格
- 当前方向更接近 warm editorial AI brand：cream canvas + dark product surface + orange callout
- 标题字体：衬线（`Cormorant Garamond` + `Noto Serif SC`），正文/UI：`Inter`
- 通用卡片、按钮、导航、footer 使用 1px hairline 边框和近乎无阴影；只有吉祥物/头像等品牌锚点保留较强描边
- 首页节奏是刻意交替的：浅色内容区 → 深色 news 区 → 橙色 CTA，不要再改回整页同一种卡片节奏

## 国际化 / 主题

- **没有使用 i18n 框架**。翻译是硬编码在 `BaseLayout.astro` 内联 `<script>` 的 `I18N` 对象。
- UI 文本通过 `data-i18n="key"` 绑定，脚本切换语言时替换 `.textContent`。
- 语言（zh/en）和主题（light/dark）持久化在 localStorage（`site-lang`、`site-theme`），通过 `<html>` 上 `data-lang` / `data-theme` 控制。
- CSS 用 `[data-theme='dark']` 覆盖暗色样式。

## 旧内容

根目录下 `20??`、`archives`、`atom.xml`、`css`、`js`、`img`、`font`、`index.html`、`search.xml` 等是旧 Hexo 构建产物，已 gitignore。不要编辑。

旧文章真实来源：`backup/source-json/content.json` 和 `backup/markdown-posts*/`。

## 设计规范

`DESIGN.md` 定义完整视觉系统。CSS 变量和组件模式应与其保持一致。

## CI

`PUBLIC_GA_MEASUREMENT_ID` 在 GitHub Actions 中以变量（非 secret）方式配置，构建时作为环境变量传入。
