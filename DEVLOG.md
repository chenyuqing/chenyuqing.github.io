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
- [ ] 没有按 verdict 筛选功能
- [ ] 没有按 series 聚合入口的增强（已有系列分组，但未做系列首页）
- [ ] 没有站内搜索页面（AI Agent 已有问答，但缺少传统搜索）
- [ ] 没有内容归档/时间线页面
- [x] 新增 `products` content collection 与产品目录页
- [x] `/products/` 列表页视觉化：Featured Band (dark) + Catalog 卡片/列表视图切换
- [x] 5 个产品上线：Subtitle Maker / Clip Agent / ASD Pipeline / VoiceWave Profile / Tonghua
- [x] 新增游戏专区与 3D 中国象棋

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

## 变更历史

- 2026-07-01（续）：产品列表页 & 详情页移动端适配补全（980px 平板断点 + 720px 手机断点修复），产品插图全部切换 AVIF 并推送。
