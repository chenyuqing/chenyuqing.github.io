# AI Agent 新闻 Bridge 运行手册

> 最后核对：2026-08-19
> 适用仓库：`chenyuqing.github.io`
> 实现入口：`scripts/ai-agent-bridge.mjs`
> 本文用于交接给其他 Agent。执行时仍应先读 `DEVLOG.md`，再核对当前代码、Git 状态和实时输出；本文不是绕过人工发布审批的授权。

## 1. 目标与边界

这套流程把“查找最新 AI 官方动态 → 生成站内新闻草稿 → 人工审核 → 单篇发布”串成一个本地 Bridge 工作流。

核心原则：

1. **静态站不保存 Provider Key**：浏览器只访问本机 Bridge。
2. **默认只写草稿**：所有新新闻首先是 `draft: true`。
3. **事实核验失败就阻止写入**：不能为了产出而补写未披露事实。
4. **发布必须二次启动并显式授权**：发布开关、一次性口令、精确确认语句缺一不可。
5. **只提交获批新闻文件**：Bridge 使用 `git commit --only`，不夹带工作区其他改动。
6. **人工审批不可被构建或模型结果替代**：标题、标签、时效、事实与是否值得发布都需要人审。

## 2. 为什么需要 Bridge

当前测试 Provider 默认是 OpenAI-compatible 地址，但账号只允许 Codex 官方客户端。浏览器直接调用以下接口会失败：

```text
POST /v1/chat/completions → HTTP 403
This account only allows Codex official clients
```

同时浏览器 `OPTIONS` 预检不返回可用 CORS 许可。因此正确调用链是：

```text
网站 AI Agent
  → http://127.0.0.1:8787/v1（本机 Bridge，OpenAI Chat 形状）
  → Codex CLI（临时 CODEX_HOME）
  → 上游 Responses Provider
```

不要通过伪造 User-Agent 或官方客户端标识绕过限制。

## 3. 关键文件

| 文件 | 用途 |
|---|---|
| `scripts/ai-agent-bridge.mjs` | Bridge、官方源发现、草稿生成、校验、构建、发布 |
| `src/layouts/BaseLayout.astro` | AI Agent Provider、`/news` 命令、“写最新新闻”预设、草稿/发布 UI |
| `src/styles/global.css` | Agent 面板和预设样式 |
| `src/content/news/*.md` | 新闻草稿与已发布新闻 |
| `src/content.config.ts` | News collection schema |
| `package.json` | `npm run agent:bridge` 命令 |
| `DEVLOG.md` | 当前实现状态、历史决定和已知边界 |

## 4. 前置检查

在仓库根目录运行：

```sh
pwd
git status --short --branch
git fetch --prune origin
git rev-list --left-right --count origin/main...HEAD
node --version
codex --version
```

要求：

- Node `>= 22.12.0`。
- `codex` 命令可用。
- 仓库路径正确。
- 发布前必须是 `0 0`（或制表符形式 `0\t0`），即本地 HEAD 与 `origin/main` 同步。
- 工作区可以有其他未提交改动，但发布动作只能提交获批新闻文件；不要清理或覆盖用户已有改动。

检查端口：

```sh
lsof -nP -iTCP:8787 -sTCP:LISTEN || true
lsof -nP -iTCP:4321 -sTCP:LISTEN || true
```

若已有 Bridge，先确认是不是本项目启动的进程，不要盲目结束未知服务。

## 5. 凭据规则

### 5.1 必须遵守

- Key 只通过进程环境变量传入。
- 不把 Key 写进源码、`.env`、`DEVLOG.md`、本文、shell 历史示例、构建产物或 Git。
- 不在回复、日志和错误摘要中重复打印 Key。
- Bridge 会创建临时 `CODEX_HOME`，其中 `auth.json` 权限为 `0600`；退出时自动删除整个临时目录。
- 发布口令使用临时随机值，不与 Provider Key 相同。

### 5.2 环境变量

| 变量 | 默认值/说明 |
|---|---|
| `ZZZCODING_API_KEY` | 首选上游 Key 变量 |
| `OPENAI_API_KEY` | Key 的兼容后备变量 |
| `AI_AGENT_PROVIDER_BASE_URL` | 默认 `https://api.zzzcoding.org/v1` |
| `AI_AGENT_MODEL` | 默认 `gpt-5.6-sol` |
| `AI_AGENT_BRIDGE_HOST` | 默认且建议保持 `127.0.0.1` |
| `AI_AGENT_BRIDGE_PORT` | 默认 `8787` |
| `AI_AGENT_PROJECT_ROOT` | 默认当前工作目录 |
| `AI_AGENT_ALLOWED_ORIGINS` | 默认允许本地 4321 和正式站点 |
| `AI_AGENT_TIMEOUT_MS` | 模型请求超时，默认 180 秒 |
| `AI_AGENT_BUILD_TIMEOUT_MS` | 构建超时，默认 180 秒 |
| `AI_AGENT_ENABLE_GIT_PUBLISH` | 默认关闭；只有值为 `1` 才允许发布 |
| `AI_AGENT_PUBLISH_TOKEN` | 发布模式必填的一次性口令 |

## 6. 默认安全模式：生成草稿

### 6.1 启动 Bridge

在仓库根目录中，把 Key 只注入当前进程：

```sh
ZZZCODING_API_KEY="$TEMP_PROVIDER_KEY" npm run agent:bridge
```

预期输出：

```text
Codex Agent Bridge listening on http://127.0.0.1:8787
Provider: https://api.zzzcoding.org/v1
Default model: gpt-5.6-sol
Git publishing: disabled
```

健康检查：

```sh
curl -sS http://127.0.0.1:8787/health
```

关键字段应包括：

```json
{
  "ok": true,
  "gitPublishEnabled": false
}
```

### 6.2 网站端配置

AI Agent 面板应选择：

```text
Provider: Codex CLI Bridge
Base URL: http://127.0.0.1:8787/v1
Model: gpt-5.6-sol
API Key: 不显示，也不需要填写
```

如果页面只有 `OpenAI (Proxy)` 而没有 `Codex CLI Bridge`，说明打开的是未包含当前 Agent 改动的旧构建；不要把上游 Key 填到旧页面尝试直连。

## 7. 写最新新闻预设

### 7.1 UI 操作

打开 AI Agent，点击：

```text
写最新新闻
```

预设会：

1. 自动切换为 `Codex CLI Bridge`。
2. 调用 `POST /v1/news/latest`。
3. 从官方 RSS 候选中选择最新、与 AI 相关且站内未收录的条目。
4. 抓取官方文章正文。
5. 生成结构化新闻 JSON。
6. 通过日期、分类、标签、来源、重复与正文长度检查。
7. 写入 `src/content/news/<slug>.md`，固定为 `draft: true`。
8. 自动运行 `npm run build`；构建失败则删除本次草稿。

当前预设官方源：

- OpenAI News：`https://openai.com/news/rss.xml`
- GitHub Changelog：`https://github.blog/changelog/feed/`
  - GitHub feed 只保留标题含 AI、Copilot、Agent、Model、GPT、Claude、Gemini 或 Grok 的条目。

候选按 RSS 时间排序，并跳过站内已有相同来源链接的新闻。官方 RSS 日期会作为主来源日期证据传给日期硬门；这不是用起草日期替代新闻发布日期。

### 7.2 直接调用接口

不经过页面也可以：

```sh
curl -sS \
  -H 'Origin: http://localhost:4321' \
  -H 'Content-Type: application/json' \
  -d '{"model":"gpt-5.6-sol"}' \
  http://127.0.0.1:8787/v1/news/latest
```

成功响应会包含：

```json
{
  "draft": {
    "slug": "example-slug",
    "draft": true,
    "filePath": "src/content/news/example-slug.md",
    "buildPassed": true,
    "publishConfirmation": "PUBLISH example-slug"
  },
  "source": {
    "title": "Official source title",
    "link": "https://...",
    "pubDate": "YYYY-MM-DD"
  },
  "gitPublishEnabled": false
}
```

### 7.3 连续生成多篇

重复调用 `/v1/news/latest` 即可。每次成功写入后，下一次会跳过已有链接，选择下一个最新候选。

不要并行调用多个最新新闻请求；串行执行，避免两个请求在去重检查前选择同一候选。

## 8. 按主题或指定来源生成新闻

### 8.1 UI 命令

```text
/news 主题、事实或官方来源 URL
```

推荐优先提供官方来源 URL：

```text
/news 请根据这个官方公告生成中文新闻：https://example.com/official-announcement
```

### 8.2 接口

```sh
curl -sS \
  -H 'Origin: http://localhost:4321' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.6-sol",
    "brief": "请根据官方来源生成中文新闻：https://example.com/official-announcement"
  }' \
  http://127.0.0.1:8787/v1/news/drafts
```

来源抓取规则：

- 只允许公开 HTTP(S) URL。
- 阻止 localhost、私网 IP 和 `.local`。
- 页面直抓失败时回退 `https://r.jina.ai/<原始 URL>`。
- Jina 返回 404 页面时仍视为失败。
- 最多处理 5 个来源 URL。
- 未提供来源 URL 时会尝试 Codex live search；若当前环境 DNS/搜索不可用，必须返回 `verificationStatus: blocked`，不得写草稿。

## 9. 自动校验与写入规则

模型结构化输出必须包含：

- `verificationStatus`
- `blockedReason`
- `slug`
- `title`
- `link`
- `category`
- `description`
- `pubDate`
- `tags`
- `body`
- `sourceUrls`
- `verificationNotes`

硬门：

1. `verificationStatus` 必须为 `verified`。
2. `slug` 必须可规范为英文 kebab-case，至少 6 个字符。
3. `link` 和至少一个 `sourceUrls` 必须是有效 HTTP(S) URL。
4. `category` 必须属于站点五大类。
5. `pubDate` 必须为真实来源日期、格式 `YYYY-MM-DD`、且不能晚于上海当天。
6. 若抓取到第一来源发布日期，草稿日期必须完全一致。
7. 标签必须为站内允许的 2–3 个唯一标签。
8. 正文至少 120 字符。
9. 标题或来源链接与站内已有新闻重复时，默认返回 HTTP 409。
10. 草稿写入后必须通过 `npm run build`。

不要使用 `force: true` 绕过重复检查，除非用户明确要求保留重复新闻并理解它会生成带时间戳的新 slug。

## 10. 人工审核清单

生成成功不代表可以发布。逐篇检查：

### 10.1 时效

- 主发布日期是否足够新。
- 是否把“Updated”误当首次发布日期。
- 相对时间如“下周”“今年夏季”是否与发布日期语境一致。

### 10.2 事实

- 标题数字、组织、产品名是否来自官方原文。
- 正文是否把计划、试点、预览写成已经全面上线。
- 是否加入来源没有披露的价格、时间表、地区或能力边界。
- 是否存在乱码、错别字或模型生成的异常字符。

### 10.3 分类与标签

- 每篇只有一个主导 category。
- tags 为 2–3 个站内标准标签。
- 不为了凑数量使用语义牵强的标签。

### 10.4 文章质量

- 标题事实化，不使用夸张点击诱饵。
- description 是事件 + 意义的一句话摘要。
- 正文 4–8 个简洁段落。
- 事实与分析分开。
- 来源列表只包含实际使用并核验过的链接。

检查草稿：

```sh
sed -n '1,240p' "src/content/news/<slug>.md"
rg -n '^(title|link|category|description|pubDate|tags|draft):' "src/content/news/<slug>.md"
```

确认仍是：

```yaml
draft: true
```

## 11. 发布审批门

### 11.1 必须获得的用户授权

用户必须明确批准具体 slug，例如：

```text
批准发布 claude-tag-slack-context-update
```

“继续”“看起来可以”“处理一下”等模糊表达，不应自动解释为发布授权。批量发布时，要求用户明确批准全部 slug 或逐篇批准。

未经明确批准，禁止：

- 改为 `draft: false`
- Git commit
- Git push
- 触发 GitHub Pages 部署

### 11.2 发布前检查

```sh
git fetch --prune origin
git rev-list --left-right --count origin/main...HEAD
git status --short --branch
rg -n '^draft: true$' "src/content/news/<slug>.md"
npm run build
node --check scripts/ai-agent-bridge.mjs
git diff --check
```

必须确认：

- HEAD 与 `origin/main` 为 `0/0`。
- 目标文件存在且仍为未发布草稿。
- 当前构建通过。
- 目标 slug 与用户批准的 slug 完全一致。

## 12. 启动发布模式

先停止默认 Bridge，再创建一次性发布口令：

```sh
PUBLISH_TOKEN="$(openssl rand -hex 24)"
```

在同一个 shell 会话中启动：

```sh
ZZZCODING_API_KEY="$TEMP_PROVIDER_KEY" \
AI_AGENT_ENABLE_GIT_PUBLISH=1 \
AI_AGENT_PUBLISH_TOKEN="$PUBLISH_TOKEN" \
npm run agent:bridge
```

预期健康检查包含：

```json
{
  "gitPublishEnabled": true
}
```

不要把 `PUBLISH_TOKEN` 输出给无关日志，也不要写入文件。

## 13. 执行单篇发布

接口要求：

- URL slug 与获批 slug 一致。
- `confirmation` 必须精确等于 `PUBLISH <slug>`。
- `publishToken` 必须等于本次 Bridge 启动口令。

示例：

```sh
SLUG='approved-news-slug'

PUBLISH_TOKEN="$PUBLISH_TOKEN" SLUG="$SLUG" python3 - <<'PY'
import json
import os
import urllib.request

slug = os.environ['SLUG']
payload = {
    'confirmation': f'PUBLISH {slug}',
    'publishToken': os.environ['PUBLISH_TOKEN'],
}
request = urllib.request.Request(
    f'http://127.0.0.1:8787/v1/news/drafts/{slug}/publish',
    data=json.dumps(payload).encode(),
    headers={
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4321',
    },
    method='POST',
)
with urllib.request.urlopen(request, timeout=240) as response:
    result = json.load(response)
    published = result['published']
    print(json.dumps({
        'slug': published['slug'],
        'draft': published['draft'],
        'filePath': published['filePath'],
        'commit': published['commit'],
    }, ensure_ascii=False, indent=2))
PY
```

Bridge 内部发布顺序：

1. 验证发布开关、口令、slug 与确认语句。
2. 将目标新闻 `draft: true` 改为 `draft: false`。
3. 运行 `npm run build`；失败则恢复原草稿。
4. 执行 `git fetch --prune origin`。
5. 要求本地 HEAD 与 `origin/main` 完全同步；否则恢复原草稿并阻止发布。
6. `git add` 目标新闻文件。
7. `git commit --only -m "feat(news): publish <slug>" -- <file>`。
8. `git push origin HEAD:main`。

注意：如果 commit 已创建但 push 失败，Bridge 会返回明确错误，但本地 commit 已存在。此时不要重复生成或重新 commit；先检查网络、远端分支和本地 HEAD，再决定重试 push 或人工修复。

## 14. 发布后验证

### 14.1 本地与 Git

```sh
rg -n '^draft: false$' "src/content/news/<slug>.md"
npm run build
test -e "dist/news/<slug>/index.html"
git fetch --prune origin
git rev-list --left-right --count origin/main...HEAD
git log -3 --oneline
git status --short --branch
```

要求：

- 新闻为 `draft: false`。
- 构建产物存在。
- HEAD 与 `origin/main` 为 `0/0`。
- 工作区其他未提交改动仍保留，未被新闻 commit 带入。

### 14.2 GitHub Actions

```sh
gh run list \
  --repo chenyuqing/chenyuqing.github.io \
  --limit 5 \
  --json databaseId,headSha,status,conclusion,workflowName,createdAt,url
```

确认目标 commit 对应的 `Deploy Astro site to GitHub Pages` 为：

```text
status: completed
conclusion: success
```

### 14.3 公开页面

```sh
curl -fsS "https://chenyuqing.github.io/news/<slug>/" >/tmp/news-page-check.html
```

再检查状态、标题和不存在草稿标记。不要只凭 GitHub Actions 成功就宣称用户可见页面已经正确发布。

## 15. DEVLOG 更新

发布后在 `DEVLOG.md` 记录：

- 来源与日期。
- 生成文件和 slug。
- 人工核验重点。
- 发布批准事实。
- 新闻 commit。
- GitHub Actions 与公开页面验证结果。

如果要提交 DEVLOG，建议单独 commit，避免 Bridge 的单文件新闻提交混入其他工作区修改：

```sh
git commit --only -m 'docs(devlog): record published <topic> news' -- DEVLOG.md
git push origin HEAD:main
```

这一步仍需确认用户允许同步开发记录；不要把它当作新闻发布接口自动授权的一部分。

## 16. 停止与清理

结束时向 Bridge 发送 `SIGINT` 或 `SIGTERM`。正常退出会删除临时认证目录。

检查：

```sh
lsof -nP -iTCP:8787 -sTCP:LISTEN || true
lsof -nP -iTCP:4321 -sTCP:LISTEN || true
find /private/var/folders /tmp \
  -type d \
  -name 'chenyuqing-agent-bridge-*' \
  -print 2>/dev/null
```

如果残留目录确认为本 Bridge 创建，才进行清理。不要删除无法确认归属的临时目录。

执行凭据模式扫描：

```sh
python3 - <<'PY'
from pathlib import Path
import re

pattern = re.compile(r'sk-[A-Za-z0-9]{20,}')
hits = set()
for root in (Path('.'), Path('dist')):
    if not root.exists():
        continue
    for path in root.rglob('*'):
        if not path.is_file() or '.git' in path.parts:
            continue
        try:
            text = path.read_text(errors='ignore')
        except Exception:
            continue
        if pattern.search(text):
            hits.add(str(path))
print('credential-pattern-hits:', len(hits))
for path in sorted(hits):
    print(path)
PY
```

预期：

```text
credential-pattern-hits: 0
```

## 17. 常见错误与处理

### 17.1 浏览器显示网络请求失败 / CORS

症状：

```text
浏览器网络请求失败。请检查 CORS、浏览器插件或代理地址。
```

检查：

- Provider 是否错误选择为 `OpenAI (Proxy)`。
- 是否把上游地址直接填为 `https://api.zzzcoding.org`。
- 正确 Provider 应为 `Codex CLI Bridge`。
- Base URL 应为 `http://127.0.0.1:8787/v1`。
- Bridge 是否正在监听 8787。
- 页面 Origin 是否在 `AI_AGENT_ALLOWED_ORIGINS` 中。

### 17.2 `This account only allows Codex official clients`

原因：浏览器或普通 HTTP 客户端直接请求了受限上游。

处理：使用真实 Codex CLI Bridge。不要反复尝试改 User-Agent。

### 17.3 HTTP 422：验证被阻止

常见原因：

- 来源无法抓取。
- topic-only live search 因 DNS 失败。
- 来源没有足够事实。
- 模型返回 `verificationStatus: blocked`。
- 日期不可核验。

处理：提供官方来源 URL，或修复官方 RSS 日期传递；不要手工填今天日期绕过硬门。

### 17.4 HTTP 409：重复新闻

说明标题或来源链接已经存在。检查：

```sh
rg -n '<来源 URL>|<标题关键词>' src/content/news
```

通常应跳过该条，继续取下一条最新新闻。

### 17.5 HTTP 429

Bridge 对 Provider 429 会等待 12 秒并重试一次。第二次仍失败则返回 429。不要无限循环请求；等待限流恢复。

### 17.6 构建失败

草稿生成阶段会删除新文件；发布阶段会恢复 `draft: true`。查看 Bridge 返回的 `npm run build` stderr/stdout 尾部，修复 schema、Markdown 或代码问题后重新执行。

### 17.7 发布接口返回 HTTP 403

- 默认 Bridge：正常，说明发布关闭。
- 发布模式：检查 `AI_AGENT_ENABLE_GIT_PUBLISH=1`、一次性口令和请求中的 `publishToken`。

### 17.8 发布接口返回同步冲突

说明 HEAD 与 `origin/main` 不再是 `0/0`。重新 fetch，检查远端新提交和本地状态。不要 force push，也不要让 Bridge 覆盖远端。

## 18. Agent 最终汇报模板

草稿阶段：

```text
已生成 N 篇新闻草稿：
- 标题 / 日期 / 分类 / slug

核验：官方来源、日期硬门、schema、npm run build 均通过。
状态：全部 draft:true，未 commit、未 push、未发布。
下一步：等待用户逐篇或批量明确批准 slug。
```

发布阶段：

```text
已发布：<标题>
Slug：<slug>
新闻 commit：<hash>
部署：GitHub Actions success
公开页面：HTTP 200，标题可见
同步：main 与 origin/main 为 0/0
清理：Bridge 已停止，临时认证目录已删除，密钥扫描 0 命中
```

## 19. 当前实现限制

- “写最新新闻”只覆盖当前代码中配置的官方 feeds，不等于全网新闻搜索。
- GitHub feed 使用标题关键词过滤，可能漏掉标题不含 AI 关键词但实际相关的条目。
- OpenAI feed 当前全部作为 AI 候选，可能出现政策、商业或治理类新闻，而不只模型/产品发布。
- topic-only Codex live search 在部分环境可能无法解析外网 DNS；优先使用官方 URL 或预设 feed。
- Bridge 是本地开发服务，不是部署在 GitHub Pages 上的后端。
- 上游 Provider、模型列表与账号限制可能变化；每次轮换 Key 后都应先做 `/health`、模型与真实回答验证。
