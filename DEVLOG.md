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
- [x] 新增浮点数位拆解工具 `/tools/float-bits/`（INT8 / FP8 E4M3·E5M2 / UE8M0 / FP16 / BF16 / FP32 / FP64）
- [x] 发布博客《给个人网站加一个 AI 生图工具，我把浏览器能踩的坑都踩了一遍》——首篇带插画的 blog（6 张小象插画 AVIF + hero 兼作 cover）
- [x] 产品可下载化启动：ASD Pipeline v0.2.5 (build 16) 经 GitHub Releases 分发（DMG 326MB），products schema 新增 download/downloadVersion/downloadSize，列表与详情页加下载 CTA

## 2026-08-29 会话记录（发布 AI 生图踩坑复盘）

### 今天完成

1. 把 `articles/ai-image-gen-postmortem.md`（用户私有的文章工作目录，不入库）整理为正式博客 `src/content/blog/ai-image-gen-postmortem.md` 并发布：
   - frontmatter：tags `["生图", "前端工程"]`、verdict `adopt`、pubDate 2026-08-29、cover 用 hero 插画。
   - 6 张小象插画从 PNG（~1.4-1.6MB/张）用 sharp 转为 1440 宽 AVIF（44-63KB/张，共约 300KB），放 `public/media/blog/ai-image-gen-postmortem/`。
   - 图片引用路径从 `assets/postmortem-illustrations/*.png` 改为 `/media/blog/ai-image-gen-postmortem/*.avif`；文末「AI 生图」加了站内工具链接。
   - hero 图只作 cover（首页/列表/详情页顶部），正文不重复内嵌同一张；01–05 五张嵌在对应章节。
2. 用户确认的关键口径：**插画是后来才有的做法，此前 12 篇 blog（pi 系列 11 篇 + 导览）保持纯文字原样，不回填插画**；本篇经用户选择「保留 6 张插画」发布。
3. 验证：`npm run build` 通过（59 页）；dist 中文章页 cover + 5 张正文插画各命中一次，首页与 `/blog/` 列表页 cover 正常引用。

### 约定备忘

- `articles/`、`.tmp-illo/` 是用户私有工作目录，禁止提交；发布文章 = 拷贝整理进 `src/content/blog/`，原图留在原处。

## 2026-08-29 会话记录（产品可下载化：ASD Pipeline）

### 今天完成

1. 把 `/Applications/ASD Pipeline.app`（v0.2.5 / build 16，用户确认是最新版）作为**可下载产品**上线：
   - 打包：`hdiutil` UDZO 压缩成 `ASD-Pipeline-v0.2.5-arm64.dmg`（681MB app → 326MB DMG，含 /Applications 拖装链接）。
   - 托管：GitHub Releases（chenyuqing/asd-pipeline，tag `app-v0.2.5`）。app 681MB 远超 git/Pages 限制，Releases 是唯一可行通道；release notes 含安装步骤、系统要求、未公证签名的 Gatekeeper 说明。
   - 同步引擎仓库：用户要求把本地未提交改动推上 GitHub，commit `9f7a42b`（Web API、focus 停顿保持、speaker-crop CLI、pyproject extras、uv.lock、todo/lessons 009–013）。
   - 站点改造：products schema 新增 `download/downloadVersion/downloadSize`；详情页 hero 下载为橙色主 CTA（有 download 时 demo 自动降为次级）+ 版本/体积/签名提示行 + CTA band 二次下载入口；列表页 featured 区加下载按钮（有 download 时「查看产品」降为次级）、catalog 卡加「可下载」徽标；`asd-pipeline.md` 重写为 app 定位（status experiment→beta，离线引擎/焦点跟随/竖屏裁剪文案，全部基于仓库 todo 与实际 bundle 取证）。
   - 教训：发布前用户问「这份是不是最新」——app 文件 birth time 8-11 只是拷贝进本机的时间，另一台电脑可能有更新版；**版本确认必须问用户，不能拿文件时间当发布依据**。首次上传因确认暂停，已删掉半成品 release 重传。
2. 验证：release 资产 HTTP 206 可下载（342,261,264 字节）；`npm run build` 59 页通过；预览截图确认详情页下载 CTA/版本行/Platform 卡渲染正常。

### 后续（其余 4 个套壳 app）

- GLM Subtitle OCR / Remote Index-TTS Dub / Clip Agent Studio（featured，会把「查看产品」降为次级按钮）/ Codex Server Console，逐个确认最新版本号后走同一流程：打包 DMG → Releases（各自仓库或本仓库）→ 产品页文案 + download 字段。

## 2026-08-29 会话记录（ASD Pipeline 发布页专业改版）

### 今天完成

1. 应用户「要专业、带真实产品截图」要求改版详情页：
   - 从 app bundle 提取真实 `AppIcon.icns`（iconutil）→ 512px AVIF（12.7KB，含透明通道），放 `/media/products/asd-pipeline/app-icon.avif`；products schema 新增 `icon` 字段。
   - Hero 右侧：有 `icon` 时显示真实 app 图标（drop-shadow）+ 规格芯片（版本 / macOS 13+ · Apple Silicon / DMG 约 326 MB），替代卡通 illo；无 icon 的产品回退原 illo 逻辑。**二轮收敛（用户反馈 logo 占地太大）**：改为单列紧凑 hero（`pdp-hero-compact`），54px 小图标内联标题左侧，版本/平台/体积/签名合并为一行 meta；根因是 `.pdp-hero-illo img { width:100%; max-width:420px }` 特异性压过图标尺寸类，把 logo 放大到 420px。**三轮调序（用户要求）**：FEATURES（核心能力）移到 SHOWCASE 截图之前，最终顺序 Hero → 核心能力 → 截图 → 安装 → 说明 → Stack。
   - 新增「获取与安装」三步区（`pdp-install`，720px 以下单列）：下载 DMG → 拖入 Applications → 首次打开（右键打开 / xattr -cr 命令）；hero 提示行收敛为仅签名提示，版本/体积移到规格芯片，避免信息重复。
   - `proddev.md` 变更记录同步。
2. 首张真实 UI 截图接入（用户提供 `~/Desktop/asd-ksa.png`，2202×1572 PNG 1.28MB → 1440w AVIF **55KB**）：单视频模式主界面（时间区间、S3FD 后端、左检测预览绿框说话人 / 右 9:16 竖屏成片同步预览），写入 `gallery` 字段带图注。连带两处模板调整：gallery 图片从 16:10 cover 裁切改为**自然比例不裁切**（UI 截图不能切窗口边），单张时全宽展示（`pdp-gallery-one`），两张起自动回到 2 列。
   - 隐私提示：截图输入框含本机路径（用户名 tim 与来源视频文件名，视频为公开 YouTube 内容），已向用户说明，由用户决定是否换图。
3. 截图通道受限记录：`screencapture`（shell 无屏幕录制权限）、CUA screenshot（ZCode Computer Use 屏幕录制未授予）均不可用；app 为原生 UI 无 webview 可用无头 Chrome 渲染。结论：UI 截图需用户自行提供（Cmd+Shift+4+空格 抓窗口）或授予屏幕录制权限。
4. 验证：build 59 页通过；预览截图确认 icon hero、规格芯片、安装三步、全宽 UI 截图画廊渲染正常。

## 2026-08-26 会话记录（浮点数位拆解工具）

### 今天完成

1. 新增 `/tools/float-bits/` 浮点数位拆解可视化工具，灵感来自一期讲「int8 → 定点数 → 浮点数 → FP8 家族」的视频字幕：
   - 支持 8 种格式：INT8（8 位补码）、FP8 E4M3（OCP，无无穷、溢出饱和 ±448）、FP8 E5M2（IEEE 风格）、UE8M0（纯指数 2 的幂）、FP16、BF16、FP32、FP64。
   - 位格子可视化：符号（红）/ 指数（金）/ 尾数（绿）三色分组，每个格子可点击手动翻转，翻转后所有读数按「这些格子解码出的值」重新计算并回写输入框。
   - 实时公式行：`(−1)^s × 1.尾数₂ × 2^E = 精确值`；结果胶囊显示输入值、实际存储值（BigInt 精确十进制展开，超长降级为最短表示）、绝对/相对误差、状态徽章（正常/子正常/零/∞/NaN）和十六进制位模式。
   - 「同一个数，在不同格式下」对比表：8 种格式的位分布条 + 精确存储值 + 绝对误差，点击行切换主格式；INT8 截断取整与 E4M3 饱和在表下有脚注说明。
   - 编码器行为与提示：非整数进 INT8 截断并提示；超范围饱和并提示；IEEE 溢出→∞、下溢→0 均有 amber note；UE8M0 负数/零不可表示、非 2 的幂就近取整均有提示。
   - 预设：0.1 / ±1 / 0.5 / π / 一亿 / 一亿+0.00001 / 极小 1e-9 / 当前格式最大值 / 最小正数 / ∞（呼应视频里「一亿不需要绝对精度」的例子）。
   - 底部可折叠「原理速览」四卡：定点数 → 浮点数 → FP8 家族（含 UE8M0 位移优化与 DeepSeek 缩放因子背景）→ 大数的相对精度。
   - 中英双语沿用 `.lang-zh/.lang-en` + `data-lang` MutationObserver 重渲染；格式与输入持久化在 localStorage `float-bits-state-v1`。
2. 核心算法实现要点：
   - 输入统一解析为 double 后做正确舍入（RTNE）：用 BigInt 在精确的 53 位有效数上移位舍入；double 子正常输入先重规范化到 53 位形式再走统一编码路径。
   - 解码侧用 (M, k) 整数对表示 `M×2^k`，经 `M×5^(−k)/10^(−k)` 生成无损精确十进制字符串。
   - E4M3 按 OCP 处理：指数全 1 且尾数 ≤110 是合法正常值，仅尾数 111 为 NaN；无无穷编码。
3. 测试：
   - 从页面提取纯函数跑 Node 单测 **67 项全部通过**，覆盖标准测试向量：FP32 0.1→0x3DCCCCCD（精确值 0.100000001490116119384765625）、FP64 0.1→0x3FB999999999999A、FP16 65504→0x7BFF / 65520→∞、BF16 π→0x4049、RTN 到偶数平局（8196→8192、8204→8208）、子正常边界晋升、E5M2 溢出边界 61440 等。
   - 测试揪出并修复两个真实 bug：① `put()` 用 JS 位运算导致 ≥32 位字段被 int32 截断（FP64 尾数损坏），改用 BigInt 提取；② INT8 补码只写入低 7 位且解码漏读最高位，改为完整 8 位跨全部格子读写。
   - 无头 Chrome 冒烟（dump-dom + CDP）：初始渲染、格式切换（格子数 8↔32）、手动翻位双向同步（int8 −5 翻符号位 → 输入框变 123）、UE8M0 负数提示、E5M2 62000→+∞ 徽章、MAX 预设（57344）、中英切换重渲染均通过，控制台无 error/warning。
4. `/tools/` 入口页新增「浮点数位拆解」卡片（icon FLT），排在首位。
5. 位分组配色按用户要求调整为：符号位红（#d96c5f）、指数位绿（#8fbf8a）、尾数位蓝（#64a8dd），位格边框/激活底色、图例圆点、对比表位分布条三处统一；INT8 数值格归入尾数蓝。配色调整过程中连带揪出并修复四个存量 bug：
   - **Astro scoped 样式对运行时 DOM 全部失效**：位格/chip/图例/对比条都是 JS `createElement` 出来的，没有 `[data-astro-cid]` 属性，scoped 选择器从不匹配——动态元素样式自首版起就未生效。已把这些规则改为「静态祖先 + `:global()` 后代」写法。
   - 图例 className 写成 `legend-item sign` 而 CSS 要求 `g-sign` 前缀，图例颜色从未命中。
   - `rtne` 在 shift=0（FP64 编码必经）时把余数 0 误判为平局（Node 中 `1n << -1n` 返回 0），所有尾数最低位为奇数的 FP64 值被多加 1 ULP；加 `shift <= 0` 精确直通守卫。
   - 解码侧隐含首位仍用数字位运算 `1 << fmt.man`，FP64 按 int32 截断成 `1<<20`，「精确存储值」完全错误；改 BigInt。
   - 单测扩到 69 项全绿（新增：奇数尾数 FP64 恒等往返、57344 精确串、π/0.1 完整展开前缀）；CDP 取色验证三组颜色在位格/图例/对比条一致命中。
6. 新增 INT4 格式（4 位补码，范围 [-8, 7]），排在 INT8 之前；借此把整数分支按位宽泛化——范围饱和提示、截断提示、图例「N 位补码整数」、公式位串、悬停解释、MAX/MIN 预设边界全部改为动态位宽，不再硬编码 8 位。工具箱卡片与页面 meta 描述同步加入 INT4。单测扩到 **79 项全绿**（新增 INT4 编解码/截断/饱和用例 + INT8 回归）。
7. 新增 INT2 格式（2 位补码，范围 [-2, 1]），泛化路径直接复用零改动；脚注、meta、工具箱卡片同步更新。单测扩到 **88 项全绿**（新增 INT2 编解码/截断/饱和用例）。
8. 开启 `/viz/llm/` 可视化专区（目标：Qwen3.8-27B 架构可视化，最终演进为 bbycroft 风格 WebGL 3D）。本期交付竖切：`public/viz/llm/index.html` 自包含静态页——数据全部取自 HuggingFace 官方 `config.json`（qwen3_5 架构）：64 层 = 48 线性注意力 + 16 全注意力（每 4 层 1 层全注意力）、GQA 24Q/4KV × head_dim 256、SwiGLU 5120→17408、部分 RoPE 25% + mRoPE [11,11,10]、视觉塔 27 层 ViT、MTP 头、词表 248320 / 256K 上下文。功能：端到端流水线图、「注意力 DNA」条、16 个 Block×4 层网格（点击看真实规格）、GQA 头共享示意、前向流动脉冲动画、zh/en 切换。按配置估算主干 ~24.4B + 嵌入 ~2.54B ≈ 官方 27B ✓。后续阶段：WebGL 3D 化、迷你模型真推理回放、站点导航入口。
   - CDP 无头浏览器 13/13 断言全过：DNA/层数/block/流水线数量、初始详情面板、点击层出 FullAttention 详情 + GQA 头示意、语言切换重渲染、过滤器 48↔64；过程中抓修一个真 bug——`renderDetail(null)` 误写 `D.intro[0]`（对象下标取值抛错）导致初始面板空白，应为 `T(D.intro)[0]`。
10. 3D 数据流动画：「播放一次前向流动」现在同时驱动 3D 塔——当前层板高亮发光（glow 2.4），身后拖 2~3 层渐弱尾迹，扫完全塔后自动复位；流水线卡片与 DOM 网格的原有脉冲同步不变。CDP 断言 5/5：脉冲爬升（pulseIdx≥20）、完成提示、复位 -1、帧缓冲仍非空、扫描后选择联动正常。
11. 3D 场景补全至与流水线一致：主塔旁新增 **27 层紫色 ViT 视觉小塔**、主塔顶新增 **金色 MTP 端帽**，均参与屏幕空间拾取——点击打开对应详情面板（复用流水线卡片的规格数据）；选中态整组发光。渲染/拾取统一重构为 ITEMS 结构。抓修一个真 bug：`select()` 向塔同步时把字符串引用（'vision'/'mtp'）错误折叠为 -1，导致点流水线卡片塔不高亮；改为原样透传。CDP 断言 9/9 全过（counts {64,27,1}、vision/MTP 详情、stage→tower 同步、层选择回归、脉冲爬升、像素非空）。至此目标各条款（竖切 + bbycroft 式 WebGL 3D 数据流）均已落地；待用户确认后推送上线。
12. **v4 重写（用户反馈"积木/不是神经网络"后的根因修复）**。取证过程：① 对 bbycroft.net/llm 场景区截图做像素统计 → 初始画面 91% 灰（#e0e0e0）、3% 深蓝，彩色立方体几乎为零——"神经网络"是按下播放后才涌现的动画，不是静态全景；② 页面 body 高仅 857px——单屏应用，叙事在画布内；③ 结合其源码 `GptModelLayout.ts` 的块级依赖图语法。诊断：此前四版错在「64 层同屏→必成噪点」「零文字标签」「静态彩纹代替数据流动」。v4 实现：默认视图 = **第 7 层（全注意力）展开图**——13 个命名算子块（输入嵌入→RMSNorm→Q/K/V 投影→Softmax 注意力→输出投影→RMSNorm→Gate/Up/Down→LM Head→MTP）横向流水线排布、纸面白底高对比值着色、**DOM 投影标签**（随相机逐帧跟随，中英双语）、残差轨 + 分支梁、点击算子块出真实规格详情（新增 q/k/v/attn/gate/up/down 等 10 组文案）；64 层总览降为可切换的次要模式（双场景双 VAO，总览里点层自动聚焦）。CDP 12/12 全过（标签数 13/定位/中英重渲染、展开态聚焦绽放、Q 块详情、总览切换 + 标签隐藏、层聚焦、脉冲映射爬升）。教训：可视化先做"一块大结构 + 标注 + 动画"，别做"全部小结构同屏"。
13. **P1 故事播放**（用户认可方向后"继续"）：FS 加 `uHeadX` 写入头——播放时数值从左到右"写进"立方体（头部之前是纸白空块，扫过处值着色 + 橙色扫描辉光 `exp(-((x-head)/0.35)²)`），不播放时 headX=-1000 全量显示。页面侧 STORY 表 13 步（每步中英字幕 + 对应流水线卡片 `.pulse` 同步 + 第 7 层 DNA 格常亮），`animateHead` 用余弦缓动按块宽自适应时长（620ms 起，~300ms/单位），步间 140ms 驻留；总览模式保留旧扫描分支。塔 API 新增 `setHeadX/headX/blockSpans/blockLabelX`。CDP 7/7：字幕①出现、写入头激活并越过 Q 块、阶段卡脉冲、中途停止复位（headX<-900 + 字幕清空）、总览扫描回归。用户浏览器已刷新。
 14. **左右分栏 + 值挤出**（反馈“还是积木 + 要左 1/3 参数配置、右 2/3 网络”）：① 布局重构为 `.viz-cols` 双栏 grid（1fr:2fr，≤1080px 折叠单栏且画布置顶）——左栏 = Inspector 详情 + 64 层栈/DNA/过滤器/层网格 + 数据流水线；右栏 = 3D 展示（画布加高至 min(66vh,600px)）。② 几何去积木化：立方体按激活值做 **Z 向挤出**（cz=CSZ*(0.42+v*1.85)，从基面向观察者生长——注意力对角热图立成“脊”、热点柱显著高于冷块）；着色改**稀疏高对比曲线** shape(v)=v<0.34?v*0.2:0.07+((v-0.34)/0.66)^0.78*0.93（大多数格子近纸白、少数炽亮）；PITCH 加大至 0.30 / CSZ 0.215。③ 坑：astro dev 对 `/viz/llm/` 返回 404（public 下 html 不映射路由），须用 `/viz/llm/index.html`；dev 仅绑 IPv6(::1)，headless Chrome 测试须用 localhost。CDP 7/7 全过（双轨比例 / 左栏归属 / 标签13 / 稀疏对比 / 故事写入头）。
 15. **抄对 bbycroft 的核心机制**（用户指“抄都没抄对”后精读其开源仓库 src/llm/*）。源码揭示三大错过的灵魂：① 一切围绕一个具体玩具任务——输入 `C B A B B C`，学会排序成 `ABBBCC`；② 每个网格都有语义轴（GptModelLayout: dimX/dimY ∈ {T,C,A,C4,n_vocab}），注意力面板是 **T×T 因果矩阵**（列=query 行=key）；③ Walkthrough 分步系统（Continue/Skip 按钮 + 相机调度 + 解说，数值来自 WASM 真前向）。本次落地 ①②③ 的本地版：画布左上角 token 条（6 个彩色字母块带 #index）；BLOCKS 改语义轴网格（行=token 列=通道切片：tok 模式同一字母激活相似；attention 改 7×7 causal——右上三角遮罩为暗、下三角亮带=近邻重要；q/k/v 权重面板 行=头 列=通道）；WSTEPS 14 步中文解说（含“因果遮罩”“残差公路”“KV 省 6×”等叙事点）+ 左上「⏮ / ▶ 继续 / ⏭ 自动」三键 + 步进度（自动模式可再按暂停；gotoStep 用填充边界链 stepBounds 记忆每步起点，prev 可回退已填状态；每步联动 setSelected→详情面板）；应用层 story-controls/tokrow CSS。CDP 7/7 全过（token 序列 CBABBC、首击进嵌入步、注意力步含“因果”解说且填充越过该块、回退重绕、自动推进并可停）。仍差：格子值是确定性模拟而非 WASM 真激活（P2）；Walkthrough.tsx 的相机编排比我的单键版丰富。
9. `/viz/llm/` 迈向 bbycroft 式 3D：新增**手写 WebGL2 3D 层塔**（零依赖，与 bbycroft 同路线）——64 块层板沿轻微螺旋堆叠，金色=全注意力（略宽）、青色=线性注意力，简单 Lambert+rim 光照；拖拽旋转 / 滚轮缩放 / 静置 1.5s 后缓慢自转；点击层板用屏幕空间最近中心拾取，与右侧详情面板和 DOM 层网格**双向联动选中**；无 WebGL2 时优雅降级为提示文案。CDP + SwiftShader 软件渲染 10/10 断言全过（含 readPixels 确认帧缓冲非空、debugSelect(7)→DOM 高亮 #7、DOM 点 #20→tower.selected===20）。注意：无头 Chrome 默认禁软件 WebGL，测试需加 `--enable-unsafe-swiftshader --use-angle=swiftshader`。



## 2026-08-27 会话记录（/viz/llm 原版移植）

### 今天完成

1. 在用户明确授权后，克隆并审计 Brendan Bycroft 的 `bbycroft/llm-viz`：commit `9da93742382f1bf36c020c38a1ace454e82c4490`（2026-08-11），MIT。原实现不是“积木塔”原型，而是完整 React/WebGL2/wasm 应用：语义张量块、3D 数据依赖、相机控制、章节目录/时间轴、Continue/Skip walkthrough，以及浏览器内运行的 nano-GPT 前向。
2. 直接采用原版静态导出链路（Next `output: export`），并以 `/viz/llm` 为 base path 重新构建；成品部署在 `public/viz/llm/`：入口 `index.html`、`_next/` 运行时与渲染 bundle、真实玩具模型权重 `gpt-nano-sort-model.json`、中间值 `gpt-nano-sort-t0-partials.json`、`native.wasm`、字体图集。当前 `/viz/llm/` 默认就是原版交互体验，而不再是先前手写的模拟 WebGL 页面。
3. 将页标题改为 `Qwen3.8-27B · LLM Walkthrough`，保留本站 Qwen 架构专区语境；但**画面中的真实可运行前向仍是原版 nano-GPT（85,584 参数，`C B A B B C → A B B B C C`）**，并不是未加载权重的 Qwen3.8-27B。不要把该真实玩具推理误报为 Qwen 推理。
4. 为遵守上游 MIT 条款，附带 `public/viz/llm/LICENSE-bbycroft-llm-viz.txt`。旧的自写 Qwen 检视器未删除，保存为 `public/viz/llm/legacy-qwen-inspector.html`，但不再是默认入口。

### 验证

- 上游构建：`node .yarn/releases/yarn-4.1.0.cjs build` 通过（Next 静态导出）。
- 本站构建：`npm run build` 通过，Astro 生成 57 个路由/端点，`dist/viz/llm/` 含入口、所有 19 个页面引用资源和 MIT 许可证。
- 静态服务：`/viz/llm/index.html`、WASM、模型权重、中间值、字体与 Next chunk 均返回 HTTP 200。
- 浏览器实测（2026-08-27 13:18 CST）：原版入口成功渲染；初态显示完整目录、3D 网络与 `C B A B B C`；点击 `Continue` 后镜头进入 token/embed 过程、页面出现真实张量数据和“Press Space to continue”，控制台 error/warn 均为空。

### 仍需人工验收

- 这是技术与可见画面验证通过，尚未得到用户对“与 bbycroft 足够像”的人工视觉验收。
- 若继续 Qwen 专项，下一步是把原版的真实前向/Walkthrough 外壳保留，同时单独接入 Qwen3.8-27B 的 config-only 总览；不能把没有权重的 Qwen 标成真实激活值。


## 2026-08-27 会话记录（Qwen3.8-27B config-only 架构图）

### 今天完成

1. 根据 Hugging Face `Qwen/Qwen3.8-27B` 发布的 `config.json` 重做 `/viz/llm/` 默认入口：`public/viz/llm/index.html` 现为 Qwen3.8-27B 的可交互 config-only 架构图，不再把原版 nano-GPT walkthrough 冒充成 Qwen 推理。
2. 真实读取并冻结配置到 `public/viz/llm/qwen3.8-27b-config.json`。图中的数据直接来自该文件：`Qwen3_5ForConditionalGeneration`、文本主干 64 层、48 层线性注意力 + 16 层全注意力（每 4 层 3×LA + 1×FA）、hidden 5,120、SwiGLU 17,408、24 Q / 4 KV（GQA）、head_dim 256、262,144 context、27 层 1,152 维视觉塔、MTP ×1、词表 248,320。
3. 右侧画布按 bbycroft 的结构语法画出输入 token、视觉 ViT、文本嵌入、多模态 merge、64 个可辨识的 LA/FA 层格、残差主干、RMSNorm、LM head 和 MTP；点击左侧 64 层序列或右图结构，会同步高亮并展示对应全/线性注意力或视觉层的真实 config 字段。画面明确写明「config-only / no weights loaded」，不显示或伪造 activation。
4. 对比 `Qwen/Qwen3.6-27B` 与 Qwen3.8-27B 的完整发布 config（排除纯元数据）结果为 0 项差异；对比引用页也标注为 0 个 graph-visible architecture changes。因此页面将它作为“结构相同”的对比注记，而不捏造版本差异。
5. 原先移植的真实 nano-GPT 演示仍保留在 `public/viz/llm/bbycroft-nanogpt-walkthrough.html`，并改名为 `nano-GPT · Original Live Walkthrough`，以避免与 Qwen 图混淆；`legacy-qwen-inspector.html` 也继续保留。

### 验证

- 提取后的原生 JS 已通过 `node --check`；`npm run build` 通过，Astro 生成 57 个路由/端点。
- 浏览器访问 `http://localhost:4321/viz/llm/index.html`：标题、官方本地 config 加载状态、64 层序列和画布均可见，控制台无 error/warn。
- 浏览器点击第 4 层 FA 后：左侧第 4 层、全注意力图例和右侧对应结构同时橙色高亮，详情切换为「第 4 层 · 全注意力」。

### 仍需人工验收

- 用户需确认：当前 Qwen 结构图是否符合“参考 bbycroft，但画出真实 Qwen3.8-27B 架构”的视觉方向；它是 config-only，不是 Qwen 权重推理回放。

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
   - 另附 `scripts/cloudflare-image-relay-worker.js`：Cloudflare Workers 版中转（`?url=` 传目标、Origin 白名单含任意端口本机来源、密钥仅透传），供站点访客使用；部署后把 `https://<name>.workers.dev/?url={url}` 填进工具的 CORS 代理设置。
   - Worker v3：请求体改为流式直传（支持 multipart 参考图上传，不再破坏二进制）。
5. 参考图上传（编辑模式）：
   - 描述框下新增「上传参考图」，jpg/png/webp/gif 最多 16 张，缩略图可单张移除。
   - 有参考图时自动切换 `POST /images/edits` multipart（image 可重复字段 + prompt/model/size/n），无参考图走原 `POST /images/generations` JSON；**不强制 `response_format`**（各站点默认不同，有的仅支持 url、有的仅 b64_json），两种返回都兼容；结果 meta 标注「参考图编辑/文生图」。
6. 端到端实测（wisart.kuaileshifu.com，OpenAI 兼容）：
   - `GET /v1/models`：返回 gpt-image-2、nano-banana-2(-pro/-lite)、grok-imagine-image。
   - `POST /v1/images/generations`（b64_json）：200 / 58.7s / 1.5MB，橘猫夕阳图符合提示词。
   - `POST /v1/images/edits`（multipart 参考图）：200 / 58.6s / 2.2MB，同一构图成功转赛博朋克雨夜风。
   - 配置版本迁移：localStorage `image-gen-config-v1` 加 configVersion=2，旧配置自动补默认代理，用户清空代理的选择此后被尊重。
   - 注意：workers.dev 在部分网络会被 SNI 干扰间歇阻断（SSL_ERROR_SYSCALL），本地调试可改用 `npm run image:relay` 的 127.0.0.1 中转绕开。
7. 自定义域中转与网络排查（最终方案）：
   - Worker 绑定自定义域 imgen.wldss.shop，绕开 workers.dev 的 SNI 阻断；工具默认代理已切换，配置版本升至 v3 自动迁移旧默认值（用户自定义过的保留）。
   - 排查结论：系统代理（Shadowrocket→机场节点）会掐 ~60s 静默长连接；代理工具加 DOMAIN-SUFFIX kuaileshifu.com DIRECT 与 DOMAIN imgen.wldss.shop DIRECT 后彻底解决。
   - 本地中转改用 curl --http1.1 主通道（Node fetch 长请求易被中间设备重置，curl 实测稳定）。
   - 浏览器端到端（无头 Chrome 模拟真实用户：注入配置→获取模型→生成→出图→截图）全流程通过。
8. 双 provider 实测：
   - wisart.kuaileshifu.com：models/生图(b64)/参考图编辑(multipart) 全通；「没有可用 token」为其上游池问题，非账户余额。
   - test.mlgb7.com（噜皮）：模型列表含 gpt-image-2 等 12 个；生图 ✅ ~62-108s 固定返回签名 URL；参考图 edits 服务端 502（文档有但后端未实现好）。

4. 排版修复与验证：
   - 修复页面漏引 `global.css` 导致整页裸样式（header 裸奔、内容撑出屏幕）。
   - 修复 `[hidden]` 被 scoped display 覆盖：加 `[hidden]{display:none!important}`，设置面板初始折叠、打开原图按钮初始隐藏。
   - 修复 Astro 模板里未转义的 `{url}` 被当表达式求值导致 ReferenceError（改用 HTML 实体）。
   - 移动端 390px 用 CDP 设备仿真验证无横向溢出（此前截图"裁切"是无头 Chrome 最小窗口宽造成的假象）；设置摘要 min-width:0 截断、尺寸/质量窄屏纵向堆叠。
   - `npm run build` 通过（56 页），中转脚本 `node --check` 通过。真实生图端到端需用户提供接口与 Key。

## 2026-08-23 会话记录（生图工具上线与失败诊断增强）

### 今天完成

1. 推送本地 5 个提交至 `origin/main`，GitHub Pages 部署成功（deploy workflow completed/success）；线上 `https://chenyuqing.github.io/tools/image-gen/` 已含新版（默认中转 `imgen.wldss.shop`）。
2. 生图页新增浏览器端精确失败诊断（`src/pages/tools/image-gen.astro`）：
   - 网络层失败时状态行显示「实际请求 URL + 浏览器原始错误 + 常见原因清单」（代理/直连、Base URL、密钥、插件/系统代理四类排查方向）。
   - HTTP 错误分支同样附带实际请求地址，便于确认代理是否生效。
   - 新增 `describeNetworkError(path, err, prefixZh, prefixEn)` 辅助函数，获取模型与生成两个分支共用；`.status-line` 加 `white-space: pre-wrap; word-break: break-all` 支持多行。
3. 无头 Chrome CDP 冒烟测试通过：不可达 Base URL + 直连时页面正确显示诊断文本，截图确认多行渲染正常。
   - 环境注意：本环境无头 Chrome 需 `--no-sandbox --disable-crashpad` 才能启动（沙箱初始化被环境拦截，报 Trace/BPT trap）。

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

## 2026-08-23 会话记录（生图工具二轮）

### 今天完成

1. **生成成功后自动下载**：`showResult` 后自动触发下载（b64 → Blob 落盘；url → 先直连 fetch、失败再走用户配置的中转）。被浏览器拦截或跨域不可取时，状态栏提示手动点「下载图片」/「查看原图」。
2. **模型列表改为自定义下拉**：原生 `<datalist>` 在多数浏览器点击不弹、不可滚动筛选，替换为自定义 combobox——获取后自动展开全部模型、点击即选并写回配置；输入时实时过滤；输入框内箭头按钮展开/收起；键盘 ↑↓/Enter/Esc；外部点击收起；当前模型带 ✓。
3. **左右两栏布局**：`≥980px` 左栏参数（接口设置/描述/预设/参考图/尺寸质量/操作/状态栏），右栏结果卡片（sticky 常驻可见）；`<980px` 回落单列堆叠。
4. **结果底部参数胶囊**（按参考图实现）：`查看原图 | 下载图片 | 图片尺寸 W×H | 图片大小 X MB`。尺寸取图片 load 事件的 naturalWidth/Height；大小取 b64 解码字节数或下载时的 blob.size。
5. **修复参考图生图在部分站点 400**：去掉 `images/edits` 硬编码的 `response_format=b64_json`（test.mlgb7.com 等站点仅支持 `response_format=url`），交给服务端默认返回格式，两种返回均已兼容。

### 验证

- 无头浏览器 CDP 冒烟 12 项全绿：下拉展开/选择/过滤/键盘、自动下载触发、胶囊数值（1 × 1 / 70 B）、桌面两栏、移动单列。

## 变更历史

- 2026-08-29：ASD Pipeline 发布页专业改版——真实 app 图标 Hero + 规格芯片、获取与安装三步区、首张真实 UI 截图接入画廊（1440w AVIF 55KB，单图全宽不裁切）。

- 2026-08-29：ASD Pipeline 成为第一个可下载产品——v0.2.5 (build 16) DMG（326MB）上 GitHub Releases，产品页新增下载 CTA 与真实 app 文案；引擎仓库同步推送（9f7a42b）。

- 2026-08-29：发布《给个人网站加一个 AI 生图工具，我把浏览器能踩的坑都踩了一遍》——首篇带插画的博客（6 张小象插画转 AVIF 共约 300KB，hero 兼作 cover）。

- 2026-08-26：新增浮点数位拆解工具 `/tools/float-bits/`——8 种格式（INT8/E4M3/E5M2/UE8M0/FP16/BF16/FP32/FP64）位格子可视化 + BigInt 精确存储值 + 全格式对比表；修复 int32 截断与 INT8 补码两个编码 bug（67 项单测全绿）。

- 2026-08-23：生图工具二轮——生成后自动下载、自定义模型下拉（替换 datalist）、左右两栏布局、结果底部参数胶囊（尺寸/大小）；修复 edits 接口硬编码 response_format 导致部分站点 400。

- 2026-07-01（续）：产品列表页 & 详情页移动端适配补全（980px 平板断点 + 720px 手机断点修复），产品插图全部切换 AVIF 并推送。

## 2026-08-27 回滚记录（/viz/llm）

- 用户否决了将 Qwen config 平面图和后续未完成的 Qwen WebGL 拓扑直接替换默认入口的方向；这些页面不再是默认入口。
- 已将 `/viz/llm/index.html` 恢复为已验证可运行的原版 bbycroft 风格 nano-GPT 3D Walkthrough（目录、Continue/Skip、可漫游张量网络）。
- 保留的非默认实验文件：`qwen-config-panel.html`、`legacy-qwen-inspector.html`；没有删除用户可回查的资源。
- 恢复后浏览器检查通过：页面渲染、目录和 3D 网络均可见，控制台无 error/warn。

## 2026-08-27 新增记录（Qwen3.8-27B 独立双栏可视化）

- 保持 `/viz/llm/index.html` 的原版 nano-GPT Walkthrough 不变；用户要求的 Qwen 可视化作为独立入口新增，避免再次覆盖已验收的页面。
- 新入口：`/viz/qwen3.8-27b/index.html`。左栏是 Qwen3.8-27B 官方 config 对应的模型结构图：27 层视觉编码器、多模态 merge、64 层文本主干、每 4 层的 3×线性注意力 + 1×全注意力、GQA 24Q/4KV、SwiGLU 5120→17408、mRoPE、RMSNorm/LM Head/MTP。
- 右栏是独立的 bbycroft 风格可漫游 3D 张量拓扑：`scene.html`，保留拖拽平移、Shift/右键拖拽旋转、滚轮缩放。3D 网格用紧凑显示轴表达 64 层真实拓扑；官方真实 config/参数信息固定在卡片和左侧结构图中，未加载权重、不伪造 activation。
- 上游 MIT LICENSE 随独立可视化一起保留；官方 config 副本位于 `public/viz/qwen3.8-27b/qwen3.8-27b-config.json`。
- 验证：Qwen 3D 场景独立加载无 error/warn；双栏页左结构图、右 iframe 3D 场景均可见；`npm run build` 通过，产物包含 index、scene、config 与 LICENSE。

## 2026-08-27 Qwen3.8-27B 双栏联动补充

- 用户明确要求保持「左侧模型结构图 / 右侧模型架构可视化」的左右结构，未改动默认 `/viz/llm/index.html`。
- `public/viz/qwen3.8-27b/index.html` 的左侧 SVG 结构图现在可点击并支持键盘 Enter/Space：多模态输入、视觉投影入口、融合嵌入、64 层主干、线性注意力、全注意力、SwiGLU 与输出头。
- 左侧点击通过同源 `postMessage` 驱动右侧 `scene.html` 的 bbycroft 3D 相机，立即聚焦对应的三维拓扑部分；右上与画布内标签同步显示当前部件。
- 视觉编码器在 config-only 3D 场景中诚实定位到「视觉 → 文本残差投影入口」；未声称加载视觉权重或真实 activation。
- 验证：实际浏览器点击全注意力、SwiGLU、RMSNorm/LM Head/输出均能使右侧镜头切换；上游 Qwen scene 的 TypeScript production build 通过。

## 2026-08-27 工具入口（Qwen3.8-27B）

- Qwen3.8-27B 双栏可视化已作为工具页加入工具箱，正式路由为 `/tools/viz-q38-27b/`（用户指定命名，不使用 `.html`）。
- 工具箱首卡已接入该入口；工具页保留站点导航和说明，嵌入原有左右联动可视化，仍可单独打开 `/viz/qwen3.8-27b/index.html`。
- 浏览器验证：工具页加载正常，iframe 内左侧结构节点仍可触发右侧 3D 部件聚焦。

## 2026-08-27 Qwen3.8-27B 简洁结构视图

- 保留默认「完整层结构」图，新增可切换的「简洁模型结构」图：仅显示多模态输入、27 层视觉编码器/投影、文本嵌入、64 层 Qwen 解码器、RMSNorm/LM Head/MTP 五级路径。
- 两张图均保持左侧可点击、右侧 3D 即时定位的联动；简洁图的 decoder 节点聚焦到代表性 4 层 3D 主干。
- 浏览器检查通过：完整/简洁视图切换、简洁图 decoder 点击及右侧焦点提示均正常。

## 2026-08-27 Qwen3.8-27B 单层简洁图修正

- 用户澄清「简洁模型结构」的 decoder 不应以 `×64`/`×48`/`×16` 汇总展示，而应只画一个可重复的代表性 Transformer Layer。
- 简洁图现显示单层的 `RMSNorm → Attention → Residual → RMSNorm → SwiGLU → Residual` 流程，以轻量 loop 标识表达解码器内重复，不展示层数汇总。
- 该单层节点新增独立 `layer` 联动目标；右侧 3D 相机现在仅聚焦一层代表性 Transformer block，而非原先的四层主干组。
- 浏览器实际验证：单层图显示正常，点击后右侧标签为「单个 Transformer Layer」且镜头切换成功。

## 2026-08-27 Qwen3.8-27B 简洁图右侧 3D 修正

- 用户指出简洁左图切换后，右侧仍显示长轴的完整 3D 网络；此前只改变了左图和相机焦点，未满足简洁视图语义。
- 简洁模式现在将右侧 iframe 切换到 `scene.html?view=layer`：使用单个紧凑 Transformer Layer 的独立 3D 布局，不渲染 64 层轴、输入链、远处模型卡或完整箭头网络。
- 紧凑 3D 仅保留本层的 RMSNorm、Q/attention、attention residual、FFN/RMSNorm、MLP residual 等 6 个语义张量块，按短路径重新排布；完整层结构切回原始 64 层可漫游拓扑。
- 修复上游 `drawAllArrows` 对单层布局仍假设至少 3 层导致的 `attnResidual` undefined；现在循环受实际 block 数限制。
- 浏览器验证：简洁图右侧为短小单层 3D 张量构造，切回完整层结构后恢复 64 层拓扑和标签。

## 2026-08-27 Qwen3.8-27B 简洁层 3D 连线补充

- 用户指出紧凑单层 3D 只有张量块、缺少计算路径连线。
- 简洁 3D 现增加可见的短路径连线：RMSNorm → Q/attention → attention residual，以及 attention residual → RMSNorm → SwiGLU → MLP residual；两段残差 bypass 以较深的中性色回路连接。
- 连线复用上游 WebGL line renderer，置于张量块前方，完整模式仍保持原 bbycroft 连线逻辑不变。
- 浏览器验证：简洁模式的蓝色计算连线、绿色数据流连线及灰色残差回路均可见；无新的应用运行时错误。
