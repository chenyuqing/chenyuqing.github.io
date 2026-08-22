# 开发日志 DEVLOG

> 本站点的开发流水记录：需求、决策、变更、TODO、当前状态。
> 每次会话开始时先读此文件，结束或完成阶段性任务时更新此文件。

## 项目速览

- 技术栈：Astro 6 静态站点生成（SSG），`output: 'static'`
- 内容：三个 Astro content collection
  - `blog` —— 深度文章/播客文章
  - `news` —— 快讯/短评
  - `products` —— 产品目录
- 部署：GitHub Pages，推送 `main` 后自动部署
- 核心文件：
  - `src/content.config.ts` —— 内容 schema
  - `src/layouts/BaseLayout.astro` —— 全站布局、导航、footer、AI Agent 面板
  - `src/styles/global.css` —— 全站样式
  - `src/pages/index.astro` —— 首页（左 AI 新闻 dark + 右 播客文章 cream）
  - `src/pages/blog/index.astro` —— 播客文章列表页
  - `src/pages/news/index.astro` —— AI 新闻列表页
  - `src/pages/blog/[...slug].astro` —— 播客文章详情页
  - `src/pages/news/[...slug].astro` —— 新闻详情页
  - `src/pages/site-index/*.json.ts` —— AI Agent 检索索引（blog-all / news-all / news-90d / news-30d）

## 内容分类体系

### Blog（播客文章）立场标签

| verdict | 含义 | 颜色 |
|---------|------|------|
| `adopt` | 实战验证，推荐采用 | 绿 |
| `trial` | 值得试用 | 蓝 |
| `assess` | 值得关注，尚需观察 | 琥珀 |
| `hold` | 保持警惕，暂不推荐 | 红 |

verdict 是「立场判断」，普通 tags 是「主题分类」，两者在 UI 上分开层级展示。

### News（AI 日报）五大分类

| 大类 | 一级标签 | 判定规则 |
|------|---------|---------|
| **模型与智能体** | 大模型、多智能体 | 模型发布、Agent 框架、推理能力、上下文/定价、多 Agent 编排 |
| **工具与应用** | AI编程、AI设计 | IDE、代码生成、设计工具、工作流、人机协作界面 |
| **机器人与硬件** | 具身智能、人形机器人、AI芯片、AI基础设施 | 机器人、VLA/世界模型、芯片、算力平台、安全架构 |
| **商业与生态** | 资本市场、产业落地、开源生态 | 融资、并购、上市、部署、量产、开源发布 |
| **安全与评测** | AI安全、评测基准 | 基准测试、审计、漏洞修复、安全体系 |

每篇 news 必须选 1 个大类作为主导分类，可挂 2-3 个一级标签。大类用于列表页快速筛选，一级标签用于交叉关联和 AI Agent 检索。

## 当前状态

- [x] 站点架构：Astro + content collection + 静态部署 完成
- [x] 首页三段节奏：AI 新闻 dark / 播客文章 cream / Contact 橙色 callout
- [x] AI Agent 面板：抽屉式对话、OpenAI/Claude/Compatible provider、用户自配 API key、连通性测试、设置保存/重置、消息复制、命中来源展示
- [x] blog 内容替换：已替换 mock 数据为真实 `pi-coding-agent` 系列 11 篇文章
- [x] `verdict` 分类体系：adopt / trial / assess / hold，已显示在首页/列表页/详情页
- [x] 播客文章详情页排版修复：表格样式、标题装饰、链接样式、列表样式、引用块、图片、hr
- [x] TOC 层级区分：h2 加粗黑体，h3 灰色缩进
- [x] 详情页 tags 可点击跳转筛选
- [x] 创建 DEVLOG.md 作为开发主记录，AGENTS.md 已指向它
- [x] 建立 news 5 大类分类体系并完成真实新闻替换
- [x] news 列表页支持按 category 和 tag 双重筛选
- [x] Blog/News 筛选与 News 分页已改为客户端 URL 状态驱动，兼容 GitHub Pages 纯 SSG
- [x] AI Agent recent/all 索引缓存已隔离，Provider 自定义模型支持刷新持久化与切换恢复
- [ ] 没有按 verdict 筛选功能
- [ ] 没有按 series 聚合入口的增强（已有系列分组，但未做系列首页）
- [ ] 没有站内搜索页面（AI Agent 已有问答，但缺少传统搜索）
- [ ] 没有内容归档/时间线页面
- [x] 新增 `products` content collection 与产品目录页
- [x] `/products/` 列表页视觉化：Featured Band (dark) + Catalog 卡片/列表视图切换
- [x] 5 个产品上线：Subtitle Maker / Clip Agent / ASD Pipeline / VoiceWave Profile / Tonghua
- [x] 新增游戏专区与 3D 中国象棋
- [x] 新增工具专区 `/tools/`，首个工具：Base64 编解码
- [x] 新增 AI 生图工具 `/tools/image-gen/`（gpt-image-2）

## 2026-08-22 会话记录（AI 生图工具）

### 今天完成

1. 新增 `/tools/image-gen/` 在线生图工具，参考 test.mlgb7.com/#/studio 的极简交互：
   - 浏览器直连用户自配的 OpenAI 兼容图片接口 `POST {base}/images/generations`，默认模型 `gpt-image-2`。
   - 配置（Base URL / API Key / 模型 / CORS 代理）存 localStorage `image-gen-config-v1`，change 时自动保存，设置头显示 host·model·密钥掩码·直连/代理摘要。
   - 尺寸预设 10 档（对齐噜皮生图表）：auto / 1:1 / 4:5 / 3:4 / 2:3 / 3:2 / 4:3 / 16:9 / 9:16 / 21:9，标签双语随语言切换（原生 option 用 data-zh/data-en + JS 换文案）。
   - 质量（自动/低/中/高）、n 固定 1；结果兼容 `b64_json` 与 `url` 两种返回；下载 b64 转 Blob，url 走 fetch→Blob、失败降级新标签打开。
   - 固定「生成结果」预览区：位于面板顶部始终可见，空态为虚线占位提示；出图后替换为图片 + 模型/尺寸/质量 meta + 下载/打开原图操作，并平滑滚动定位。
   - 预设提示词 8 组（毛绒玩偶/微缩场景/绘本插画/赛博朋克/产品图/水彩/像素/小红书封面），点击填入模板、【】占位替换主体。噜皮的提示词库接口 `/api/prompts` 需登录（401），无法爬取，改为内置等价模板。
   - 生成中按钮禁用 + 秒数计时；错误区分 HTTP 状态、CORS/网络拦截、无图片数据；⌘/Ctrl+Enter 触发生成。
2. `/tools/` 入口页新增「AI 生图」卡片（icon GEN），排在 Base64 之前。
3. 新增 CORS 中转 `scripts/image-cors-relay.mjs`（`npm run image:relay`）：
   - 仅监听 127.0.0.1:8789，路径 `/proxy/{encoded-url}`，转发方法/Content-Type/Authorization/body 并补 CORS 头。
   - Origin 白名单（localhost:4321 / chenyuqing.github.io 等，env 可覆盖）、禁 file://、20MB body 上限、5 分钟超时；已用本地 echo 服务验证 POST + Authorization 透传。
   - 页面设置里填 `http://127.0.0.1:8789/proxy/{url}` 即可调用不支持 CORS 的接口。
   - 另附 `scripts/cloudflare-image-relay-worker.js`：Cloudflare Workers 版中转（`?url=` 传目标、Origin 白名单、密钥仅透传），供站点访客使用；部署后把 `https://<name>.workers.dev/?url={url}` 填进工具的 CORS 代理设置。
4. 排版修复与验证：
   - 修复页面漏引 `global.css` 导致整页裸样式（header 裸奔、内容撑出屏幕）。
   - 修复 `[hidden]` 被 scoped display 覆盖：加 `[hidden]{display:none!important}`，设置面板初始折叠、打开原图按钮初始隐藏。
   - 修复 Astro 模板里未转义的 `{url}` 被当表达式求值导致 ReferenceError（改用 HTML 实体）。
   - 移动端 390px 用 CDP 设备仿真验证无横向溢出（此前截图"裁切"是无头 Chrome 最小窗口宽造成的假象）；设置摘要 min-width:0 截断、尺寸/质量窄屏纵向堆叠。
   - `npm run build` 通过（56 页），中转脚本 `node --check` 通过。真实生图端到端需用户提供接口与 Key。

## 2026-08-19 会话记录（修复纯 SSG 筛选、分页与 AI Agent 状态）

### 今天完成

1. 修复 `/blog/` 标签筛选在 GitHub Pages 纯 SSG 下不生效的问题：
   - 构建时输出全部文章，浏览器根据 `?tag=` 过滤卡片。
   - 筛选链接使用 `history.pushState` 更新 URL，支持浏览器前进/后退恢复状态。
   - 动态维护 active tag、首张 featured 卡、系列标题和无结果状态。
2. 修复 `/news/` 分类、标签和分页在纯 SSG 下不生效的问题：
   - 构建时输出全部日期分组和新闻条目。
   - 浏览器端支持 `category + tag` 组合筛选，并保持 URL 可复制、可直接访问。
   - 分页继续按日期组计算，每页 3 天；筛选改变时自动回到第 1 页。
   - 支持上一页/下一页、浏览器前进/后退、越界页码归一化和无结果状态。
3. 验证结果：
   - `npm run build` 通过，仍生成 54 个 Astro 页面/端点。
   - Blog：`AI Agent` 显示 11 篇，`LLM推理` 显示 1 篇，URL 与 active 状态同步。
   - News：默认第 1 页显示 3 个日期组/13 条，第 2 页显示 1 个日期组/4 条。
   - `工具与应用` 分类显示 3 条；叠加 `AI设计` 后显示 1 条；不兼容组合显示空状态。
4. 修复 AI Agent recent/all 索引缓存串用：
   - 缓存键改为实际 news 索引 URL，`news-30d` 与 `news-all` 分开保存。
   - 缓存 Promise 避免并发重复请求；请求失败时删除对应缓存，允许后续重试。
   - 增加索引 HTTP 状态检查，失败时提供明确错误。
5. 修复 Provider 自定义模型被默认值覆盖：
   - 加载 localStorage 配置时不再触发会重写 model 的 change 事件。
   - 每个 Provider 在当前页面会话内独立记忆 model，切换回来时恢复原值。
   - 重置设置时同步恢复各 Provider 默认模型和输入提示。
6. AI Agent 验证结果：
   - 保存虚拟 OpenAI 自定义模型后刷新页面，provider、model、Base URL 摘要均正确恢复。
   - 切换 Claude 时显示 Claude 默认模型，再切回 OpenAI 后恢复自定义模型。
   - 模拟 recent → all → recent 查询，分别命中 `news-30d`、`news-all`、缓存的 `news-30d`，缓存键数量为 2。
7. 调通仅允许 Codex 官方客户端的第三方 Provider：
   - `/v1/models` 可读取 7 个模型，但浏览器直接调用 Chat Completions 和 Responses 均返回 `This account only allows Codex official clients`，且无 CORS。
   - 使用临时 `CODEX_HOME` 和真实 Codex CLI，通过 `wire_api = "responses"` 成功调用 `gpt-5.6-sol`。
   - 新增 `scripts/ai-agent-bridge.mjs`：仅监听 `127.0.0.1`，从环境变量读取 Key，临时写入权限为 `0600` 的 Codex auth 文件，退出时删除运行目录。
   - Bridge 提供 `/health`、`/v1/models`、`/v1/chat/completions`，包含 Origin 白名单、CORS、Private Network 预检、请求大小限制和超时。
   - AI Agent Provider 新增 `Codex CLI Bridge`，默认连接 `http://127.0.0.1:8787/v1`，不要求浏览器保存 API Key。
   - 真实端到端验证通过：网站测试连接成功；提问声音克隆文章后，`gpt-5.6-sol` 返回三篇总结，并展示 5 个站内来源，无运行时错误。
   - 临时 Key 未写入源码、DEVLOG、构建产物或 Git diff。

8. 增加新闻草稿工作流 `/news`：
   - Agent 面板识别 `/news 主题、事实或来源 URL`，只路由到本地 Codex CLI Bridge 的新闻端点。
   - 来源 URL 由 Bridge 抓取；直抓失败时回退到 `r.jina.ai`，并阻止 localhost、私网地址和 `.local` 地址。
   - topic-only 搜索依赖的 Codex 外网搜索在当前环境 DNS 不可用时返回 `verificationStatus: blocked`，不写入未经核验的草稿。
   - 模型只能根据抓取到的来源生成结构化 JSON；`verificationStatus`、News schema、分类、标签、来源和重复检查均通过后，才写入 `draft: true`。
   - 草稿写入后自动运行 `npm run build`；构建失败会删除本次新建文件。
9. 加固新闻日期核验：
   - 从来源正文提取 `Published Time` / `Date`，并将英文月份按日历文本解析，避免时区转换造成日期前移。
   - 草稿 `pubDate` 必须与第一来源的主发布日期一致；来源更新日期不得替代主发布日期。
   - 已覆盖 `Oct 20, 2025`、`October 20, 2025` 与 ISO 日期解析回归检查。
10. 新闻草稿验证结果：
   - 曾生成 `src/content/news/claude-code-on-the-web-research-preview.md`，来源为 Anthropic 官方发布页和官方文档。
   - 草稿保持 `draft: true` 时通过了 News schema 和 `npm run build`，且未进入公开构建输出。
   - 人工审核发现其主发布日期为 2025-10-20，不符合当前新闻时效要求，已在发布前删除；未执行 `draft: false`、commit 或 push。
   - 发布默认关闭；未开启发布模式时发布接口返回 HTTP 403。
11. 临时 Provider 认证轮换后的最终连通性：
   - 使用新临时凭据重启本地 Bridge，`/health`、`/v1/models` 和真实 `gpt-5.6-sol` Chat Completions 均成功。
   - Bridge 仍只监听 `127.0.0.1`，认证只存在进程环境与临时 Codex 运行目录，不进入项目文件。
12. 生成并发布近期新闻：
   - 从 Anthropic 2026-08-13 官方产品公告生成 `src/content/news/claude-tag-slack-context-update.md`。
   - 主题为 Claude Tag 扩大 Slack 频道上下文读取范围，官方称主动响应判断提升约 30%。
   - 已人工对照官方原文核验频道上下文、四种响应动作、自然语言控制、`Respond automatically` 开关、费用边界和 Teams / Enterprise 可用范围。
   - 经明确批准后，通过 Bridge 发布流程将 `draft: true` 改为 `draft: false`，执行构建、单文件 commit 和 push；发布 commit 为 `69a1121c`。
13. AI Agent 新增“写最新新闻”预设：
   - 面板新增一键预设，自动切换到 `Codex CLI Bridge`，不再要求用户手工输入 `/news` 命令或错误选择浏览器直连 Provider。
   - Bridge 新增 `POST /v1/news/latest`，从 OpenAI News 与 GitHub Changelog 官方 RSS 中选择时间最新、与 AI 相关且站内未收录的条目。
   - 预设按官方 RSS 发布时间排序并跳过重复链接；RSS 日期作为来源日期证据传给现有日期硬门，不因文章正文缺少机器可读日期而放宽校验。
   - 网页侧仍只接收 `draft: true` 草稿，发布继续要求独立人工批准、发布口令、构建、同步检查和单文件 commit。
14. 生成三篇 2026-08-18 最新新闻草稿：
   - `github-copilot-jetbrains-enterprise-managed-settings.md`：GitHub Copilot for JetBrains 企业托管设置。
   - `chatgpt-ads-europe-expansion.md`：ChatGPT Ads 扩展至 31 个欧洲国家。
   - `openai-democratic-ai-oversight.md`：OpenAI 投入 500 万美元支持政府 AI 监督机构。
   - 三篇均来自对应官方公告，已人工核对关键数字、功能边界与适用范围；全部保持 `draft: true`，未提交或发布。
15. 新增 Agent 新闻 Bridge 运行手册：
   - 新增 `docs/agent-news-bridge-runbook.md`，整理从凭据隔离、启动 Bridge、发现最新官方新闻、生成草稿、人工审核、精确发布到 GitHub Pages 验证和清理的完整流程。
   - 文档明确记录日期硬门、重复检查、构建回滚、`git commit --only`、发布口令、推送失败边界和常见错误恢复方式。
   - `AGENTS.md` 顶部新增入口，要求后续 Agent 执行新闻生成或发布前先阅读该手册和 `DEVLOG.md`。
16. 修复猜数字判定反馈歧义：
   - 猜中后将范围收敛为实际答案 `value–value`，不再把旧的下界显示成答案；此前会出现猜中 46 却大字显示 44 的误导。
   - 输入改为严格整数校验，拒绝空值、小数和非整数转换，避免 `parseInt` 截断造成错误判定。
   - 猜测处理增加短暂锁定、按钮禁用和游戏结束保护，防止候选按钮重绘期间双击/连点把新按钮误触为正确答案。
   - 浏览器验证 8 轮二分猜测、胜利数字显示、小数输入和双击路径均通过。
17. 游戏专区巡检记录：
   - 9 个游戏桌面和 390×844 移动视口均加载无控制台 error/warning，未发现横向溢出（猜数字的 `html zoom` 使 CSS scrollWidth 虚高，但视觉未溢出）。
   - 后续优先优化：移动端语言按钮与各游戏标题/返回按钮的顶部层叠、坦克/蘑菇奇兵/五子棋/俄罗斯方块开场面板的信息密度与滚动、后台标签页暂停 RAF/计时器，以及游戏大厅的分类/快速进入。
18. 游戏运行时资源与触摸交互优化：
   - 五子棋新增临时 Three.js 对象释放：胜利连线、禁手提示和智能提示移除时同步释放几何体与材质，避免重复开局/提示造成资源累积。
   - 俄罗斯方块触摸按钮新增 `pointercancel` 与 `lostpointercapture` 清理，避免系统手势中断后左右移动/软降自动重复定时器残留。
   - 变更后五子棋和俄罗斯方块页面加载无控制台 error/warning，生产构建通过。
19. 重做钢铁防线开场 UI：
   - 开场时隐藏背景 HUD、侧栏和移动控制，仅保留模糊战场背景与语言切换，消除两套界面重叠。
   - 10 个关卡大按钮改为前后切换、当前关卡信息和圆点快速选择；同步展示每关敌军数量。
   - 主操作收敛为全宽“开始战斗”，规则默认折叠，退出降为次级操作；修正旧说明中“共 4 关”为实际 10 关。
   - 统一桌面、390×844 竖屏和 844×390 横屏布局；移动断点从 820px 扩展到 900px，确保常见手机横屏仍显示触控操作。
   - 增加按钮语义、`aria-pressed`、规则 `aria-expanded` 和键盘焦点样式；中英文动态关卡信息均验证通过。
   - 浏览器验证关卡 1–10 选择、规则展开/收起、选择第 10 关开战、竖屏/横屏和英文界面，无控制台 error/warning。

20. 重做钢铁防线守护堡垒与飞行棋 UI：
   - 钢铁防线的守护目标从低矮黄色方盒升级为八角指挥堡垒：抬高装甲肩台、四座高位防御塔、红色能源核心、黄铜护盾环、红金盾徽、信标与战旗，确保在基地护墙内仍有明确剪影和红色识别点。
   - 保留 `BASE_COL = 12`、`BASE_ROW = 24`、基地碰撞与敌军命中判定，视觉重做不改变关卡胜负逻辑；信标、能源核心、护盾环和战旗继续使用轻量循环动画。
   - 飞行棋开场收敛为玩家数选择、三条核心规则、主操作和独立完整规则弹层；游戏内顶栏、计时器、战况、工具区和掷骰按钮改为紧凑航空仪表式 HUD。
   - 修复飞行棋竖屏相机距离进入旧雾效区间导致棋盘严重变暗的问题，将雾效推远，手机棋盘恢复正常亮度；语言按钮在开场、桌面 HUD 和移动 HUD 分别定位，不再遮挡计时器或战况。
   - 完整规则关闭控件从不可聚焦的 `span` 改为语义化按钮，并补齐新开场文案的游戏共用中英文映射与 `aria-pressed` 状态。
   - 浏览器验证 1280×720 桌面、390×844 竖屏、844×390 横屏，覆盖玩家数切换、规则打开/关闭、中英文切换、开局掷骰、HUD 恢复和棋盘可见性；钢铁防线与飞行棋均无控制台 error/warning。
   - `node --check`、`git diff --check` 和 `npm run build` 通过，Astro 共生成 55 个页面/端点。

21. 修复钢铁防线后期堡垒没有钢板保护：
   - 根因是 10 关共用同一套红砖 U 形护墙，而且旧逻辑在生成基地护墙时把 row 25 的地图外墙钢板重新覆盖成红砖。
   - 新增 `applyBaseDefense(stageNumber)`，基地装甲随关卡递进：第 2 关加固侧墙，第 3 关形成钢制角堡，第 6 关增加双肩钢板，第 9–10 关扩展为双层钢翼。
   - 中央始终保留两块可破坏红砖闸门，钢板保护关键侧翼但不会把基地永久封死；敌军仍可在闸门被击穿后命中堡垒。
   - row 25 基地段恢复为永久钢制外墙，不再被后续地图生成降级为红砖。
   - 浏览器可见验证第 3、6、10 关桌面布局与第 10 关 390×844 手机布局，钢板层级清晰、堡垒可辨识且玩家出生通道未被堵塞；无控制台 error/warning。
   - 内联脚本 `node --check`、`git diff --check` 和 `npm run build` 通过。

### 后续优先项

- `DEVLOG.md` 仍需继续补齐 2026-07-20 至 2026-08-16 期间的游戏提交历史。

## 2026-07-20 会话记录（工具专区）

### 今天完成

1. 新增 `/tools/` 工具箱入口页（深色卡片风格，与游戏大厅一致）。
2. 新增首个工具 `/tools/base64/`：
   - 本地 UTF-8 Base64 编码 / 解码
   - 上下互换、复制结果、清空
   - 编码/解码模式切换，⌘/Ctrl + Enter 执行
3. Header 导航与 Footer 增加「工具 / Tools」入口与中英文字段。

## 2026-07-19 会话记录（坦克大战多关升级）

### 今天完成

1. 坦克大战实现多关 + 每关不同地图的逐关升级：
   - 新增 `STAGES` 配置数组，包含 4 关：经典对称砖墙 / 十字砖墙 + 中央钢块 / 走廊迷宫 / 迷宫堡垒
   - 每关 `layout()` 函数定义独立地图；难度参数（敌军数量 20→36、同屏上限 4→7、速度 5.2→7.0、开火概率 0.018→0.032、冷却 1.05→0.72）逐关递增
   - `loadStage()` 根据当前 `stage` 应用对应布局与参数；`spawnEnemy` 颜色按关卡主题切换
2. 关卡推进流程：当前关敌人清空 → `nextStage()` 暂停并显示「第 X 关 守住 / 下一关：第 X+1 关」横幅 → 点击「进入下一关」按钮 → `advanceToStage()` 保留玩家分数与生命、重建地图、刷新敌军配置
3. 最终关胜利 → `finish(true)` 显示「防线守住 · 全关通关」；基地失守 → `finish(false)`
4. HUD `关卡 STAGE` 改为 `X/4` 显示
5. 修复用户反馈的「坦克大战开始页面下方没有退出按钮」：
   - 开场卡片底部新增「← 返回游戏专区」退出链接
   - 结算横幅下新增「← 返回游戏专区」退出链接
   - 战况面板新增「← 退出」按钮
6. 已运行 `npm run build`，45 页构建通过。

### 游戏大厅续改

1. `飞鸟穿云` 从独立的竖屏卡片框架改为全视口横向战场：3D 场景、HUD、开场提示和底部控制均覆盖在浏览器视口内。
2. 视觉统一为其他游戏使用的深色、暖金、楷体战场语言，移除蓝绿色页面底框与重阴影。
3. 游戏大厅卡片先渲染 CSS 后备插画，再叠加封面图片；图片资源加载失败时不再显示空白封面。
4. `flappy-bird-xiaoxiang.png` 是新增且尚未纳入版本控制的资源，发布前必须与 `flappy-bird.html`、`flappy-bird.astro` 一并提交，否则线上不会有该游戏的生成封面。

## 2026-07-18 会话记录

### 今天完成

1. 新增 `/games/` 游戏专区，以可扩展的游戏目录呈现当前可玩的游戏与后续位置。
2. 新增 `/games/chinese-chess/` 二级详情页，包含玩法信息、返回专区入口、全屏控制与嵌入式对局。
3. 用户提供的自包含中国象棋页面作为 `/games/chinese-chess-3d.html` 独立资源保留运行，并增加高可见的返回首页按钮。
4. Header 与 Footer 均增加游戏专区入口，并补充中英文导航文本。
5. 游戏专区首页改为深色游戏大厅：使用实际 3D 棋局作为主视觉，仅展示已上线游戏和单行游戏库索引。
6. 中国象棋二级页直接进入原始全屏游戏，不嵌入 iframe；游戏顶部提供返回游戏专区入口。
7. 游戏库页移除重复的“AVAILABLE GAMES / 游戏库”标题，保持深色大厅背景；象棋开场页在“开战”下方增加同样式的“退出”主按钮，返回 `/games/`。
8. 已运行 `npm run build`，静态构建通过。

## 2026-06-30 会话记录

### 今天完成

1. 用真实 `pi-coding-agent` 系列文章替换 blog mock 数据（11 篇）。
2. 增加 blog `verdict` schema 字段与可视化标签：
   - adopt：实战验证，推荐采用
   - trial：值得试用
   - assess：值得关注，尚需观察
   - hold：保持警惕，暂不推荐
3. 重新设计 verdict 标签颜色与层级关系：
   - 颜色改为更明确的绿/蓝/琥珀/红，避免 adopt 和 trial 混淆
   - verdict 作为「立场判断」放在标题上方，普通 tags 作为「主题分类」保留在 meta 行，两者不再混排
4. 修复播客文章详情页排版：
   - 增加表格完整样式（hairline 边框、cream 表头、hover 高亮）
   - h2 衬线 + 顶部分隔线；h3 衬线 + 橙色左竖线；h4 大写标签风
   - 链接、列表、strong、图片、hr 统一优化
   - 修复 TOC 层级：h2 加粗黑体，h3 灰色缩进
   - 文章详情页 tags 改为可点击链接
5. 建立 news 5 大类分类体系：模型与智能体 / 工具与应用 / 机器人与硬件 / 商业与生态 / 安全与评测
6. 替换 news mock 数据为真实 AI 日报（17 条），每篇新闻分配 category 和 2-3 个 tags
7. news 列表页和详情页增加 category 色标显示；列表页支持 category + tag 双重筛选
8. news 列表页按日期分组展示，每天一个 section，分页按天切分
9. 首页视觉升级（实验性）：
   - AI 新闻区改为深黑 + 暗红渐变背景，14s 呼吸动画
   - 右上角添加红色光晕，10s 缓慢漂移
   - 左上角添加 35° 红色斜线光带，7s 从左下扫到右上
   - Contact CTA 改为米白到浅灰渐变，带白色高光扫过和暗酒红按钮
   - 整体从 warm editorial 橙向红灰科技感试探
10. 首页双栏 hover 展开效果：
    - 默认 AI 新闻区 / 播客文章区左右 1:1
    - hover AI 新闻区 → 左侧展开到约 1.85:1，右侧压缩
    - hover 播客文章区 → 右侧展开到约 1.85:1，左侧压缩
    - 压缩侧描述和图片淡出隐藏，标题字号缩小
    - 0.7s cubic-bezier 过渡动画
11. 首页双栏高度修复：
    - 去掉固定 height: 720px
    - 页面加载后 JS 自动测量并锁定 split 自然高度
    - hover 只变宽不变高，避免底部 CTA 重叠和内容截断
12. Footer 文案重写：
    - 标题改为「在 AI 的浪里，搭一座慢站点」
    - 描述改为「不追热点，不堆噪音。把模型发布、工具实验、播客思考与创作工作流，慢慢写成一本可以翻阅的手册。」
13. Footer 站点列调整：
    - 删除 Site 列中的「首页」链接（与品牌块/导航重复）
    - 列标题与链接保持左对齐，与品牌区第一行对齐
    - footer 列改为明确的纵向 flex 布局，避免标题高度 hack 导致 News / Writing 整列下移
14. 新增站内阅读指南文章：
    - 新增《如何阅读这个网站》作为站内导览文章
    - 内容覆盖首页入口、Blog/News 阅读方式、verdict / tags / series 解释、快速阅读路径
15. 导览文章置顶：
    - 首页 blog 区与博客列表页都将《如何阅读这个网站》固定置于最前
16. 站点两侧小象装饰：
    - 使用 illo 技能生成小象（xiaoxiang）形象，storybook-plush 风格
    - 透明底 PNG，色彩匹配站点红灰/米白主题（#f7f5f2 纸色 + #7a2828 酒红点缀）
    - 左象静坐面右（290px），固定于页面顶部左侧，象鼻探入 AI 新闻卡左上角
    - 右象站立面左（170px），固定于页面右下侧
    - opacity 0.18，仅 1300px+ 大屏可见
17. AI 对话面板从黑色改为米白呼吸渐变背景，与 Contact CTA 风格一致
18. 移动端适配：
    - 汉堡菜单（≤720px 显示，点击展开导航面板）
    - 导航按钮全宽堆叠，触控目标 ≥44px
    - 首页双栏触屏点按展开（tap-to-expand）
    - 表格窄屏横向滚动（overflow-x: auto）
    - 移动端字号/间距/卡片尺寸收紧
19. 新增 Products 内容线：
    - 新增 `products` collection，独立于 blog/news
    - 新增 `/products/` 列表页与 `/products/[slug]/` 详情页
    - 产品页采用“产品语言”而非 GitHub 仓库视角，突出定位、受众、状态、stack 与相关文章
20. 首个产品条目 `Subtitle Maker`：
    - 以 `beta / media-tool` 进入产品目录
    - 提炼为“本地完成字幕、翻译、配音与成片导出的 Mac 工作台”
    - 关联 `pi-voxcpm-dubbing`、`pi-hard-subtitle-extraction`、`pi-seed-vc-voice-cloning` 三篇 blog
21. 导航与 About 接入 Products：
    - Header 内容下拉新增 `Products`
    - Footer Site 列新增 `产品`
    - About 中 `Subtitle Maker` 卡片改为链接到真实产品页，并新增产品目录入口区块
22. 新增第二个产品条目 `ASD Pipeline`：
    - 定位为 `experiment / ai-tool`
    - 提炼为“把 Active Speaker Detection 变成可恢复、可测试、可复用的本地能力入口”
    - 关联 `pi-active-speaker-detection` 文章，作为视频理解基础能力模块进入产品目录

### 最新提交

- `7bd6eef8` —— 修复博客文章排版、TOC 层级、可点击 tags；创建 DEVLOG.md
- `7e05b41e` —— AGENTS.md 顶部增加指向 DEVLOG.md 的说明；同步 verdict schema 与新增博客模板
- `a30fc5d9` —— AGENTS.md 与 DEVLOG.md 交叉同步
- `0ef038f3` —— news 5 大类分类体系 + 真实 news 替换 + category 筛选
- `940abc31` —— news 列表页按日期分组展示，每天一个 section，分页按天切分
- `aec3347d` —— 首页 AI 新闻区 + Contact CTA 红灰动态渐变背景
- `（当前会话）` —— 首页双栏 hover 展开/折叠交互效果

### 当前未解决问题

- 文章页若有宽表格（如 LLM 推理效率教程），在窄屏上可能溢出。已加 `overflow-x:auto` 给 pre 但未给 table。下次确认是否需要 table 响应式。
- 详情页 verdict 标签现在是可点击的 span 样式，未来可能也需要链接。
- 首页视觉方向正在从 warm editorial 橙转向红灰科技感试探，后续需要整体协调（header、footer、blog 区等是否跟进）。
- `products` 已有 `Subtitle Maker` 和 `ASD Pipeline` 两条，后续仍需继续补第三、第四个产品，形成更完整的目录层。

## 设计规范摘要

- 标题字体：衬线（`Cormorant Garamond` + `Noto Serif SC`）
- 正文/UI 字体：`Inter`
- 主色：品牌橙 `#FF8A00`
- 卡片/按钮/导航：1px hairline 边框，几乎无阴影
- 背景节奏：cream canvas → dark product surface → orange callout
- 首页结构：左 AI 新闻（dark）+ 右 播客文章（cream）+ 底部橙色 Contact
- 只有吉祥物/头像等品牌锚点保留较强描边

## 约定

- 不在代码中硬编码 API key、token、密码。AI Agent 配置全存在用户 localStorage。
- 不要直接编辑旧 Hexo 产物（根目录 `20??`、`archives`、`atom.xml` 等）。
- 不要更新 `README.md` 中的 Hexo 旧内容，除非用户明确要做迁移文档。
- `DESIGN.md` 顶部已注明过时，当前以代码、`AGENTS.md` 和 `DEVLOG.md` 为准。遇到不确定问题或需求矛盾时优先查看 `DEVLOG.md`。
- 所有内容变更优先改 collection 文件，构建后 push 即自动部署。

## 需求池（用户口述/待安排）

- 将 news 区 mock 数据替换为真实 AI 新闻内容。
- 考虑增加按 verdict 筛选博客。
- 考虑增加站内搜索页（或把 AI Agent 的检索能力暴露为搜索 UI）。
- 考虑增强 series 页面，做成独立系列入口页。
- 持续保持播客文章详情页的排版质量，后续每篇新文都要符合当前样式。
- 持续补充 `products` 条目，把适合展示的 GitHub 项目转成产品页。

## 下次会话 TODO

1. 查看用户当前最优先需求，从需求池挑一件做。
2. 开始前检查本文件状态；结束后更新本文件。
3. 每次变更后运行 `npm run build` 验证，通过后再 push。

## 2026-07-01 会话记录

### 今天完成

1. `/products/` 列表页视觉化改进（多轮迭代）：
   - **Featured Band 保留**：深色背景大卡，右侧产品 illo（`max-height: 200px`），文字含 title + tagline + description + stack + actions
   - **Catalog 卡片视图**：上图下文，`height: 320px`，图占 3/5（`flex: 3`），文占 2/5（`flex: 2`），文字精简为 status + type + 标题 + tagline
   - **Catalog 列表视图**：行式紧凑布局，图片按列表行高自适应（fit to 行高，带上下留白），右侧显示 title + tagline + meta capsules（platform / stack / tag）
   - **视图切换按钮**：Catalog heading 右侧卡片/列表 toggle，选择记忆 localStorage
   - 删除 catalog 卡片的 tags 列表、日期、详情按钮，点击整个 illo 或标题跳转详情页
   - 移动端：Featured 卡片和 catalog wrap 单列，illo 高度缩小
2. 产品条目增加到 5 个：
   - Subtitle Maker (beta/featured) / Clip Agent (live/featured)
   - ASD Pipeline (experiment) / VoiceWave Profile (experiment)
   - Tonghua (beta)
3. 产品 illo 全套完成：5 张主题 illo + 15 张核心能力插图
   - Tonghua 新增 1 张主题 illo + 3 张核心能力插图

### 当前未解决问题

- 文章页若有宽表格（如 LLM 推理效率教程），在窄屏上可能溢出。已加 `overflow-x:auto` 给 pre 但未给 table。下次确认是否需要 table 响应式。
- 详情页 verdict 标签现在是可点击的 span 样式，未来可能也需要链接。
- 首页视觉方向正在从 warm editorial 橙转向红灰科技感试探，后续需要整体协调。
- products 列表页可考虑后续加入筛选（按 status/type）。

## 2026-07-01 会话记录（续）

### 今天完成（下半场）

1. **产品页移动端适配修复**（`src/styles/global.css`）：
   - **980px 平板断点**：`.product-feature-card` 单列（illo 上文字下）、`.pdp-feature-grid` 和 `.pdp-related-list` 改为 2 列
   - **720px 手机断点**：
     - `.products-stats`：4 列 → 2 列（修复溢出）
     - `.product-catalog-item`：固定 320px → `height: auto`（去除多余空白）
     - `.products-featured-band`：padding 1.2rem → 0.85rem
     - `.product-catalog-wrap`：gap 1.2rem → 0.85rem
     - 列表视图：`flex-direction: column`，illo 改为 `max-height: 110px; width: 100%`，body grid 回退 1 列
2. 产品插图全部切换为 AVIF（20 张），`src/content/products/*.md` 引用同步更新，已推送。

## 2026-07-20 会话记录（飞行棋重构）

### 当前完成，待提交

1. 重写 `public/games/aeroplane-chess.html` 的渲染层与状态模型：
   - 棋子进度统一为基地 `-1`、外圈 `0-47`、归航 `48-53`，避免旧版本外圈/归航状态和反弹规则混用。
   - 固化规则为：`6` 起飞与再掷、同格击落、同色叠放、必须刚好抵达中央终点、四架飞机先到者胜。
   - 修复旧版点击监听注册过早、AI 掷出 `6` 后卡回合、实际棋盘格误判为同格、终点多走一格等问题。
2. 视觉重做：程序绘制完整漆木飞行棋盘，加入连续外圈航路、四角机场、四色归航道、中央云台、云海和独立骰子台座；棋子升级为带机翼、座舱、描金机头与旋转螺旋桨的 3D 飞机。
3. 骰子改为可读的实体六面骰：六面完整点阵、实体边缘、掷骰停止后实际点数朝上；浏览器逐面验证 `1-6` 点数正确。
4. 交互与适配：可移动飞机使用金色航标环选取；拖动镜头不会误触走棋；竖屏自动拉远相机，实测棋盘四角和骰子台均在视区内；重开复用棋子资源，不再反复创建 WebGL 几何体。
5. 游戏大厅新增 `aeroplane-chess-xiaoxiang.avif`，用 illo 技能生成的小象主题封面并接入卡片。
6. 已运行 `npm run build`；浏览器已验证起飞、击落、终点临界、超点禁走、骰子六面点阵和移动端视口，无新的运行时错误。
7. 第二次重写（经典规则 + 视觉）：
   - 明亮象牙棋盘、有色格/起点/虚线飞越、四角基地、中央云台、云海、棋盘旁骰子台。
   - 完整经典规则：同色跳跃、虚线飞越、击落、终点反弹、连续三个 6 回基地、掷 6 再掷。
   - 掷骰大按钮固定底部中央，可空格/点击 3D 骰子台掷骰；规则面板可查看。
   - 玩家阵营标识：开场「你执红方」、战况「你」标签、回合「你的回合」、红方基地上方「你」徽章+光柱。
8. 规则路径浏览器实测通过：起飞/跳跃/飞越/反弹/击落/三个 6 惩罚，无运行时错误。

### 待提交

- `public/games/aeroplane-chess.html`
- `public/games/lib/game-i18n.js`
- `public/media/illo/games/aeroplane-chess-xiaoxiang.png`
- `public/media/illo/games/aeroplane-chess-xiaoxiang.avif`
- `src/pages/games/index.astro`
- `DEVLOG.md`

## 变更历史

- 2026-07-01（续）：产品列表页 & 详情页移动端适配补全（980px 平板断点 + 720px 手机断点修复），产品插图全部切换 AVIF 并推送。
