---
title: "我的第一篇新博客文章"
description: "这是新站点博客系统的示例文章。"
pubDate: 2026-05-14
tags: ["blog", "astro", "setup"]
draft: false
---

这是新站点的第一篇文章示例。

你以后写博客只需要：

1. 在 `src/content/blog/` 新建一个 `.md` 文件
2. 写好 frontmatter（标题、日期、标签）
3. `npm run build` 后 push 到 GitHub

## Frontmatter 模板

```md
---
title: "文章标题"
description: "一句摘要"
pubDate: 2026-05-14
tags: ["AI", "workflow"]
draft: false
---
```

`draft: true` 的文章不会出现在线上列表里。
