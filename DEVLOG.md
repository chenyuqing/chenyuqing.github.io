# 开发日志 DEVLOG

> 本站点的开发流水记录：需求、决策、变更、TODO、当前状态。
> 每次会话开始时先读此文件，结束或完成阶段性任务时更新此文件。

## 项目速览

- 技术栈：Astro 6 静态站点生成（SSG），`output: 'static'`
- 内容：两个 Astro content collection
  - `blog` —— 深度文章/播客文章
  - `news` —— 快讯/短评
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

## 下次会话 TODO

1. 查看用户当前最优先需求，从需求池挑一件做。
2. 开始前检查本文件状态；结束后更新本文件。
3. 每次变更后运行 `npm run build` 验证，通过后再 push。

## 变更历史

- 2026-06-30：创建本 DEVLOG.md，记录当前状态与当天变更；与 AGENTS.md 完成交叉同步（verdict schema、新增博客模板、DEVLOG 指向说明）。
