# 改造计划：AI 时代网志

## 核心定位

个人创作站 → AI 时代内容站。内容驱动，首页是内容流，不是个人 hero。

## 决议汇总

### 站点身份

- 首页 = 精简 intro（一行定位 + 副标题 + 少量链接）+ 内容流 + Contact 底部
- 吉祥物、项目展示移至 About 页
- 首页砍掉：Hero 卡通区、Video、Focus、Projects、Records

### 首页结构

```
Intro（一行定位 + 副标题 + 关于/RSS/GitHub 链接）
↓
最新文章（blog，3 篇大卡片，不限时间）
↓
最新动态（news，5 条小卡片，只展示最近 14 天）
↓
Contact 简卡
```

### 内容模型

**Blog 和 News 拆为两个 collection：**

- Blog = 深度文章，低频，大卡片展示
- News = 快讯/短评，高频，小卡片展示
- 首页按类型分区展示，非混合时间线

**Blog schema：**

```yaml
title: string          # 必填
description: string    # 可选
cover: string           # 可选，/media/blog/xxx.png
pubDate: date           # 必填
updatedDate: date       # 可选
tags: string[]           # 独立体系，和 news 互不干扰
series: string           # 可选，系列名
lang: string             # 可选，默认 "zh"，值 "zh" | "en"
draft: boolean           # 默认 false
```

**News schema：**

```yaml
title: string          # 必填
link: string           # 可选，外部链接
description: string    # 可选，无则截取正文前 N 字
cover: string          # 可选，/media/news/xxx.png
pubDate: date          # 必填
tags: string[]         # 独立体系
draft: boolean         # 默认 false
```

- 正文（Markdown body）可选
- 有正文 → 详情页展示完整内容
- 无正文 → 详情页展示 description + "阅读原文"链接
- 所有 news 条目统一先进入站内详情页，不直接跳转外部链接

### 内容语言

- 中文为主，部分英文
- 每篇文章用 `lang` 字段标记语言
- UI 的 i18n 切换保留（只管界面文本，不管内容翻译）

### News 时效性

- 首页只展示最近 14 天的 news
- /news/ 页面完整归档，含 tag 筛选 + 时间倒序翻页（每页 15 条）
- 旧 news 不删除不隐藏，仅从首页自然消退

### News 内容形态

- 混合型：链接点评 + 短文并存
- 有 `link` 字段 → 渲染为链接点评（description 写点评）
- 无 `link` → 渲染为短文
- cover 可选，有图则展示，无图则纯文字

### Blog 增强功能

- `/blog/` 列表页：加 tag 筛选 + series 分组入口
- 文章详情页：加侧边 TOC + 预计阅读时间 + 代码块增强（复制按钮、语言标签）
- Series 功能：文章页底部"本系列其他文章"导航 + `/blog/series/<series-name>/` 独立页
- 封面图存 `public/media/blog/`

### News 增强功能

- `/news/<slug>/` 详情页：简洁布局，无 TOC，突出"阅读原文"按钮
- News 封面图存 `public/media/news/`

### About 页重写

三大区域：

1. **人** — 头像/吉祥物 + 个人定位
2. **做** — 项目展示（从首页移来）
3. **写** — 写作方向 / 兴趣地图

### 导航栏

首页 / 关于 / 博客 / 动态 / GitHub（加"动态"入口）

### AI Agent

- 右下角悬浮按钮 + 侧边抽屉对话面板
- 支持三种 provider：OpenAI / Claude / OpenAI Compatible（DeepSeek、Groq、Ollama 等）
- 用户自配 API key + provider，面板顶部齿轮图标内嵌设置
- 首版只做站内内容问答（基于全站索引检索 + LLM 生成回答）
- 全站内容索引：构建时 `astro:build:done` 钩子生成三个分片 JSON：
  - `blog-all.json` — 全部 blog
  - `news-30d.json` — 最近 30 天 news
  - `news-90d.json` — 最近 90 天 news
- 客户端关键词检索索引 → top N 相关条目注入 prompt
- 配色遵循现有 dark mode 体系

### RSS

分频道 + 全站兜底，共三个 feed：

- `/blog/rss.xml`
- `/news/rss.xml`
- `/rss.xml`（全站）

### 旧文章处理

- 精选迁移至新 blog collection
- 其余留 `backup/` 存档

### 发布流程

维持现状：push main 直出，不设分支流程。

## 实施顺序

1. **首页重构** — Intro + blog 3 篇 + news 5 条占位 + Contact
2. **News collection + 页面** — schema + /news/ 列表页(含 tag 筛选+翻页) + /news/\<slug\>/ 详情页
3. **Blog 增强** — schema 加 cover/series/lang + /blog/ 列表页增强 + 文章详情页 TOC/阅读时间/代码块 + series 功能
4. **About 页重写** — 人+做+写 三区
5. **AI Agent** — 悬浮按钮 + 对话面板 + 索引生成 + 客户端检索
6. **RSS feeds** — 三个 feed
