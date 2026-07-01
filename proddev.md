# 产品页面开发规范 (proddev.md)

## 1. 设计方向

产品详情页不是"产品介绍文章"，而是一个**产品 Landing Page**。

参考风格：busy.app — 极简、高对比、单色强调、宽松编辑式布局。
融合元素：站点小象 (Xiaoxiang) illo 作为产品主题插画，保持品牌一致性。

### 核心原则

| 原则 | 说明 |
|------|------|
| 视觉优先 | 每个产品有专属主题 illo，核心能力也配独立插图，不靠文字堆砌 |
| 节奏感 | Hero → Divider → Showcase → What It Does → Features → Stack → Related → CTA，不是连续文章 |
| 留白充分 | 参考 busy.app 的 spacious editorial 感，section 间距 clamp(2.5rem, 6vw, 4.5rem) |
| 单色强调 | 橙色 (#ff8a00) 只用于主 CTA 和关键高亮 |
| 信息不重复 | 每条信息只出现一次，在最合适的位置 |

---

## 2. 页面结构

```
┌─────────────────────────────────────────────────┐
│  HERO                                           │
│  ┌───────────────────────┬────────────────────┐ │
│  │ Eyebrow · Status      │                    │ │
│  │ Product Title (大)     │   Product Illo     │ │
│  │ Tagline               │   (themed elephant)│ │
│  │ [Demo] [GitHub]       │                    │ │
│  └───────────────────────┴────────────────────┘ │
├────────────────── hairline ─────────────────────┤
│  SHOWCASE (video / screenshot gallery)          │
│  ┌─────────────────────────────────┐            │
│  │         media content           │            │
│  └─────────────────────────────────┘            │
├─────────────────────────────────────────────────┤
│  WHAT IT DOES (简洁说明，2-3 段)                 │
│  左：文字  右：metrics sidebar                   │
├─────────────────────────────────────────────────┤
│  FEATURES (3-col grid)                          │
│  每个 feature = illo + title + desc，卡片式      │
├─────────────────────────────────────────────────┤
│  STACK & META (horizontal strip)                │
│  Stack tags · Published · Tags                  │
├─────────────────────────────────────────────────┤
│  RELATED POSTS                                  │
├─────────────────────────────────────────────────┤
│  CTA BAND (返回产品目录)                         │
└─────────────────────────────────────────────────┘
```

> **已移除 Highlights Strip**：原来 Hero 下方有一个 3 列要点条带，但它和 Features Grid 信息重复（同一个 `highlights` 数据源）。现在只保留 Features Grid，用一条 hairline 分界线 (`pdp-divider`) 替代 Highlights Strip 的位置。

---

## 3. 设计细节

### 3.1 Hero

- 背景：cream canvas（浅色，不是 dark band）
- 标题：`var(--font-display)`，clamp(2.2rem, 5vw, 3.2rem)，`color-ink`
- Tagline：1.1rem，`color-body`，max-width 30rem
- CTA：橙色主按钮 (`button-primary`) + ghost 次按钮 (`button-ghost`)
- 右侧：产品主题 illo（小象做对应主题的事），max-width 420px
- 高度：自适应，不固定 min-height
- 布局：`grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr)`

### 3.2 Divider

- Hero 下方一条 hairline 分界线
- 实现：`<hr class="pdp-divider" />`
- 样式：`border-top: 1px solid var(--color-hairline)`

### 3.3 Showcase

- 视频或图片画廊（按需出现）
- 视频：16:9，`border-radius-xl` + hairline 边框
- 画廊：2 列网格，每张 16:10

### 3.4 What It Does

- 不是 markdown 全文渲染
- 从 frontmatter 的 description + audience 拼出概述文案
- 如果有额外 markdown body，折叠在 `<details>` 里（"更多说明"）
- 右侧 sticky sidebar：Status / Type / Platform 指标卡
- 布局：`grid-template-columns: minmax(0, 1fr) minmax(220px, 0.36fr)`

### 3.5 Features Grid

- 来源：frontmatter `highlights` 数组
- 每个卡片可包含插图（`highlights[].illo`，可选）
- 卡片结构：illo（4:3，负 margin 贴边顶部）→ title → description
- 卡片：浅色背景 (`color-surface-cream-strong`)，微圆角，无描边
- 标题加粗，描述 body 色
- 布局：3 列网格
- 插图：4:3 比例，`object-fit: cover`，贴满卡片顶部

### 3.6 Stack Strip

- 水平 flex 标签行
- 使用 `tag-code` 样式
- 包含 Stack tags、Published 日期、Tags
- 上下各有 hairline 分割线

---

## 4. Illo 生成规范

### 4.1 产品主题 illo

每个产品生成一张主题 illo，放在 `/public/media/illo/products/` 下。
路径写入 frontmatter 的 `illo` 字段。

### 4.2 核心能力插图

每个核心能力（highlight）可配独立插图，放在 `/public/media/illo/products/` 下。
路径写入 `highlights[].illo` 字段。

### Prompt 模板

```
A 4:3 landscape editorial illustration on a solid cream background #f7f5f2.

Composition: Xiaoxiang, the baby elephant mascot, [FEATURE-SPECIFIC SCENE].

CHARACTER (locked): the recurring mascot — Xiaoxiang, the baby elephant mascot
from the reference image: soft rounded elephant body, oversized ears, curled
trunk, small tusks, rounded limbs and feet, red-and-white propeller beanie,
and short red cape; keep the same face, proportions, costume, and
children's-book plush illustration treatment as the reference. The ONLY
accent-colored character parts are the red beanie and red cape. It MUST
perform the move, not decorate.

LINE LANGUAGE: bold, even-weight, softly-rounded outline, matching the
storybook-plush style.

STYLE: warm children's-book plush illustration. Soft fur texture, gentle
cel-shaded volume, plain warm cream paper background.

PALETTE: paper #f7f5f2. Structure ink #1a1816. Accent #7a2828 (wine red)
for beanie and cape only. [PROPS COLOR] for the themed objects.

NO LABELS, NO TEXT, NO TITLE.
```

### 已生成的 illo 清单

| 文件 | 用途 | 场景 |
|------|------|------|
| `subtitle-maker.png` | Subtitle Maker hero | 小象戴耳机面对字幕时间轴屏幕 |
| `clip-agent.png` | Clip Agent hero | 小象用鼻子指向说话人的人脸框 |
| `asd-pipeline.png` | ASD Pipeline hero | 小象用鼻子指向说话人的人脸框 |
| `voicewave-profile.png` | VoiceWave Profile hero | 小象对着麦克风说话，头像中有声波可视化 |
| `sm-feature-local.png` | Subtitle Maker / 本地优先 | 小象 + 笔记本 + 锁图标 |
| `sm-feature-pipeline.png` | Subtitle Maker / 一条链路走完 | 小象走过 5 块功能跳板石 |
| `sm-feature-output.png` | Subtitle Maker / 面向真实生产 | 小象举场记板和胶片帧 |
| `ca-feature-highlights.png` | Clip Agent / AI 高光识别 | 小象用放大镜扫描字幕文本 |
| `ca-feature-tracking.png` | Clip Agent / 智能人形跟踪裁剪 | 小象跟踪人形热力框 |
| `ca-feature-platforms.png` | Clip Agent / 6 平台一键适配 | 小象手持 6 个平台图标 |
| `asd-feature-staged.png` | ASD Pipeline / 阶段式运行 | 小象走过分阶段管道 |
| `asd-feature-resume.png` | ASD Pipeline / 恢复与复用 | 小象从中间断点继续 |
| `asd-feature-structured.png` | ASD Pipeline / 结构化结果 | 小象将工件放入 JSON 容器 |
| `vw-feature-face.png` | VoiceWave / 智能人脸裁剪 | 小象用人脸检测框选取头像 |
| `vw-feature-audio.png` | VoiceWave / 音频同步动画 | 小象配音波可视化振幅 |
| `vw-feature-styles.png` | VoiceWave / 5 种视觉风格 | 小象面对 5 个风格卡片 |
| `tonghua.png` | Tonghua hero | 小象坐在圆毯上读故事书，旁边手机显示声波 |
| `th-feature-clone.png` | Tonghua / 15 秒声音克隆 | 小象握麦克风，口中飘出半透明声音分身 |
| `th-feature-story.png` | Tonghua / AI 童话生成 | 小象在小木桌前用羽毛笔写卷轴，上方闪烁城堡和龙 |
| `th-feature-ios.png` | Tonghua / 原生 iOS 体验 | 小象举起 iPhone 边框展示 App 图标 |

---

## 5. Schema 字段

```yaml
# 产品级
illo: string          # 可选，产品主题插画路径
video: string         # 可选，产品演示视频
heroImage: string     # 可选，hero 备用图（illo 优先）
gallery: array        # 可选，图片画廊 [{ src, alt, caption }]
highlights: array     # 核心能力 [{ title, description, illo }]
demo: string          # 可选，Demo 链接
demoLabel: string     # 可选，Demo 按钮文案
```

---

## 6. Markdown Body 精简策略

产品 markdown 不再写文章式内容。精简为：

```markdown
---
(frontmatter 保持不变)
---

一到两段补充说明（可选）。
如果 frontmatter 的 description + highlights 已经足够，body 可以为空。
```

结构化信息全部提升到 frontmatter：
- `highlights` → Features grid（含插图）
- `description` → What It Does 概述
- `audience` → What It Does 补充行
- `stack` → Stack strip
- `body` → 折叠在 details 里，不作为主内容

---

## 7. CSS 命名

class 前缀统一为 `pdp-`（Product Detail Page）：

```
.pdp
.pdp-hero
.pdp-hero-main
.pdp-hero-illo
.pdp-divider
.pdp-showcase
.pdp-gallery
.pdp-about
.pdp-about-main
.pdp-about-side
.pdp-side-card
.pdp-features
.pdp-feature-grid
.pdp-feature-card
.pdp-feature-illo
.pdp-stack-strip
.pdp-related
.pdp-related-card
.pdp-cta-band
```

> 已移除：`.pdp-highlights`、`.pdp-highlight-item`（Highlights Strip 已删除）

---

## 8. 和 busy.app 设计对照

| busy.app 特征 | 本站产品页对应 |
|---------------|---------------|
| 纯白画布大留白 | cream canvas + section spacing clamp(2.5rem, 6vw, 4.5rem) |
| 单色橙色强调 | #ff8a00 只用于主 CTA |
| Pragmatica 几何无衬线 | Inter body + Cormorant display |
| 紧凑按钮 (small radius) | radius-sm 6px 按钮 |
| 无重阴影 | shadow-soft 或无阴影 |
| 产品图居中浮动 | illo 在 hero 右侧浮动 |
| 轻量 chip/badge | tag-code / tag-product-status |

---

## 10. 产品列表页 (`/products/`)

### 页面结构

```
┌─────────────────────────────────────────────────┐
│  HERO                                           │
│  标题 + 描述 + stats 卡片 (Total/Live/Beta/Exp) │
├─────────────────────────────────────────────────┤
│  FEATURED BAND (dark)                           │
│  ┌───────────────────────┬────────────────────┐ │
│  │ Status · Type         │                    │ │
│  │ Title (大)             │   Product Illo     │ │
│  │ Tagline               │   max-h: 200px     │ │
│  │ Description (3行截断)  │                    │ │
│  │ Stack tags            │                    │ │
│  │ [查看产品] [GitHub]   │                    │ │
│  └───────────────────────┴────────────────────┘ │
├─────────────────────────────────────────────────┤
│  CATALOG                                        │
│  ┌─────────┐ ┌─────────┐                        │
│  │  Illo   │ │  Illo   │  ← 卡片视图 (默认)     │
│  │ 3/5高   │ │ 3/5高   │                         │
│  │ Status  │ │ Status  │                         │
│  │ Title   │ │ Title   │  ← 2/5 文字，精简      │
│  │ Tagline │ │ Tagline │                         │
│  └─────────┘ └─────────┘                        │
│  (列表视图: 小缩略图 + 标题 + tagline 行式)      │
│  [视图切换按钮 卡片/列表]                         │
├─────────────────────────────────────────────────┤
│  BUILD NOTES                                    │
└─────────────────────────────────────────────────┘
```

### Featured Band

- 深色背景 `radial-gradient + linear-gradient`
- 卡片：`grid-template-columns: 1.2fr 0.8fr`，右列放产品 illo
- illo：`max-height: 200px`，`object-fit: cover`
- 文字保留：status + type + title + tagline + description（3 行截断）+ stack tags + actions

### Catalog 卡片视图

- 2 列网格，`gap: 1.2rem`
- 卡片固定高度 `320px`，`flex-direction: column`
- 图占 3/5（`flex: 3`），文占 2/5（`flex: 2`）
- illo：`object-fit: cover`，hover 时 `scale(1.03)`
- 文字极简：status 标签 + type 标签 + 标题 + tagline（2 行截断）
- 无 footer、无日期、无 tags 列表、无按钮，点击 illo 或标题跳转详情页

### Catalog 列表视图

- 单列，无边框行式，`border-bottom` 分隔
- 48px 圆角缩略图 + 标题 + tagline（单行截断）
- 切换按钮：`.view-btn`，选择存 `localStorage('products-view')`

### 视图切换

- 位置：Catalog heading 右侧
- 两个 SVG icon 按钮：卡片（2x2 grid）、列表（3 横线）
- active 状态：黑底白字
- 切换改 `data-view` 属性 + localStorage 记忆

---

## 11. 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-01 | 初始版本：Hero → Highlights → Showcase → Features → Stack → CTA |
| 2026-07-01 | Highlights 的 `illo` 字段支持，Features 卡片可配插图 |
| 2026-07-01 | 移除 Highlights Strip（与 Features Grid 重复），改用 `pdp-divider` hairline 分界线 |
| 2026-07-01 | Hero 从 dark band 改为 cream canvas（与站点整体浅色基调一致） |
| 2026-07-01 | What It Does 的 markdown body 改为折叠在 `<details>` 里 |
| 2026-07-01 | 产品列表页视觉化重构：Featured Band 保留 + Catalog 卡片(3:2 图文比)/列表双视图 + 视图切换 toggle |
| 2026-07-01 | 新增 Clip Agent / VoiceWave Profile 产品及全套 illo |
