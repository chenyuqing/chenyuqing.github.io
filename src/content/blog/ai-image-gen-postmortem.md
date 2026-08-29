---
title: "给个人网站加一个 AI 生图工具，我把浏览器能踩的坑都踩了一遍"
description: "在纯静态站上做在线 AI 生图工具的完整踩坑复盘：CORS、中转架构、SNI 域名阻断、代理杀长连接、多 provider 兼容与零依赖 E2E。"
pubDate: 2026-08-29
tags: ["生图", "前端工程"]
verdict: "adopt"
cover: "/media/blog/ai-image-gen-postmortem/00-hero-relay-expedition-zh.avif"
draft: false
---

> 一个纯静态网站、一把用户自带的 API Key、一个「看起来很简单」的在线生图页面。
> 结果三个开发会话下来，CORS、Cloudflare、代理软件、CDN 域名阻断、多 provider 兼容……浏览器生态里能踩的坑，我一个没落下。
> 这是一份完整的踩坑复盘，也是一份「在纯静态站上做重交互工具」的实战笔记。

## 0. 起点：需求很小，坑很大

我的个人站是 Astro 6 纯静态站（SSG），部署在 GitHub Pages 上，push 到 `main` 就自动上线。我想在工具区加一个在线 AI 生图页面，交互参考一个我很喜欢的站点：极简的提示词框 + 尺寸/质量选择 + 固定位置的出图区。

需求拆下来只有三条：

1. **用户自配 API**：Base URL + API Key 填在页面上，存 localStorage，站方不持有任何密钥；
2. **兼容 OpenAI 兼容协议**：`POST /v1/images/generations`，模型默认 `gpt-image-2`；
3. **纯前端完成**：没有后端，所有请求从浏览器直接发。

第 3 条就是所有故事的开始。**「浏览器直接发请求」这六个字，在今天的互联网里，几乎等于「向 CORS、代理软件和各家的接口怪癖同时宣战」。**

最终的架构长这样：

```
访客浏览器
   │  （需要 CORS 头）
   ▼
Cloudflare Worker 中转（自定义域 imgen.wldss.shop，补 CORS 头、流式透传）
   │  （服务器之间，没有 CORS 概念）
   ▼
任意 OpenAI 兼容生图接口（wisart / 噜皮 / 你自己的服务）
```

下面按时间顺序复盘。

## 1. 页面实现：Astro 的小坑合集

页面本身不到一千行，但 Astro 和浏览器给了我一组入门礼。

### 1.1 `{url}` 不是文本，是表达式

设置区有一段说明文案，里面写了占位符 `{url}`。构建直接炸：

```
ReferenceError: url is not defined
```

Astro 模板里裸的 `{...}` 会被当 JS 表达式解析。文案里的花括号必须转义成 HTML 实体：

```html
&#123;url&#125;  <!-- 渲染出来才是 {url} -->
```

而属性值里的花括号（`placeholder="...proxy/{url}"`）因为在引号里，反而没事。这种「同一字符两种命运」的坑，只有构建报错时才会发现。

### 1.2 忘了一行 import，整页「排版错乱」

第一版上线自己手机上打开，header 裸奔、内容溢出右边缘、字体全丢。排查半天，原因是一行代码：

```astro
---
import '../../styles/global.css';
---
```

我的设计系统是单文件 CSS，每个页面要自己 import。新页面忘了引，于是全站 shell、字体变量、header/footer 样式全部缺席。**用户报 bug 说「排版是错乱的」，而我在桌面宽屏下差点没看出问题——窄屏才暴露得最明显。**

### 1.3 你的 `hidden` 可能被自己的 CSS 打败

设置面板用 `hidden` 属性控制折叠，但我给 `.settings-body` 写了 `display: grid`。CSS 的 display 规则优先级高于 UA 样式表里 `[hidden] { display: none }`，于是面板永远展开。

解法一行，放在 scoped 样式最前面：

```css
[hidden] { display: none !important; }
```

这行代码后来救了好几个元素（包括结果区的「新标签打开」按钮，它是 `inline-flex`，同样无视 `hidden`）。

### 1.4 `<option>` 里塞不进 `<span>`，双语下拉只能靠 JS

站里有中/英切换，常规 UI 文本都用 `.lang-zh/.lang-en` 两个 span 配合 `html[data-lang]` 切换。但原生 `<option>` 里放 span 会被解析器直接剥掉，而且 CSS 也控制不了原生下拉部件的显隐。

最后的办法是给 option 挂数据属性，语言切换时用 JS 换文案：

```html
<option value="1024x1365" data-zh="3:4 竖版作品" data-en="3:4 Portrait">3:4 竖版作品</option>
```

```js
Array.from(sizeSelect.options).forEach((opt) => {
  opt.textContent = isEn() ? (opt.dataset.en || opt.value) : (opt.dataset.zh || opt.value);
});
```

**原生表单控件是 i18n 的飞地**，这件事值得记进任何静态站的多语言方案里。

### 1.5 无头浏览器截图的「最小宽度幻觉」

有一轮我怀疑移动端有横向溢出，因为 390px 宽的截图右边总是被裁掉。后来用 CDP 的 `Emulation.setDeviceMetricsOverride` 做精确探测才发现：`scrollWidth === 390`，根本没有溢出。

真相是 **Chrome headless 的窗口有一个约 500px 的最小宽度**，`--window-size=390` 并不会真的把视口设到 390，截图自然被裁。要做真·小视口验证，必须走 Emulation 域，而不是启动参数。这个幻觉浪费了我整整一轮排查。

## 2. CORS 第一课：为什么必须有「中转」

很多 OpenAI 兼容接口只面向服务端调用，响应里不带 `Access-Control-Allow-Origin`。浏览器里 `fetch` 这种接口，结果就是四个字：`Failed to fetch`。

CORS 是纯浏览器机制——**服务器之间的请求根本不存在这回事**。所以中转的思路是：浏览器只跟中转说话（中转返回 CORS 头），由中转去调真接口。

![浏览器面前是带锁的 CORS 大门，旁边打开了一扇写着“中转”的小门](/media/blog/ai-image-gen-postmortem/01-cors-relay-gate.avif)

### 2.1 第一代：本地中转（只救得了我自己）

我先写了个 Node 脚本 `npm run image:relay`，监听 `127.0.0.1:8789`，页面里填 `http://127.0.0.1:8789/proxy/{url}`。自己电脑调试完美，但它有个根本缺陷：**访客浏览器里的 `127.0.0.1` 指的是访客自己的电脑**。这条路只能自用。

### 2.2 第二代：Cloudflare Workers（访客也能用了）

Cloudflare Workers 免费版每天 10 万次请求、全球边缘节点，天然适合做公开中转。我做了个带 Origin 白名单的 relay Worker：只放行我的站点域名和 localhost，别人拿到地址也调不动；API Key 不落地，`Authorization` 头原样透传。

部署后我直接浏览器地址栏打开 Worker 地址，看到：

```json
{"error":{"message":"Origin not allowed."}}
```

第一反应是「坏了」，其实**这恰恰说明防护在生效**——地址栏直开没有 Origin 头，当然被白名单拦。但裸访问直接报错确实不友好，于是改了一版：不带目标参数的裸访问返回健康检查 `{"ok":true,"service":"image-cors-relay"}`，只有「带了目标但来源不对」才拒绝。

**小工具的错误提示也要分场景设计，否则用户（包括我自己）会把「防护生效」误读成「服务坏了」。**

### 2.3 第三代前夜：参考图上传炸出了二进制坑

后来加了「上传参考图」功能（multipart 走 `/images/edits`，最多 16 张）。本地中转第一版用 `await request.text()` 读 body 再转发——**这一步会把二进制文件破坏掉**。multipart 里的图片字节经过文本编码往返就废了。

解法是流式直传：

```js
// Worker / 本地中转：不要碰 body，直接透传流
const upstream = await fetch(target, { method, headers, body: request.body });
```

本地中转后来还经历了一次更大的重构（见第 4 章），但「中转永远流式透传、不要缓冲解码二进制」是血泪教训第一条。

## 3. workers.dev 被墙了？换域名就能活

链路通了没多久，我自己电脑上开始稳定复现 `Failed to fetch`。抓包发现：**所有发往 `*.workers.dev` 的请求，TLS 握手直接被重置**——这是针对域名的 SNI 阻断特征。Worker 代码没问题、白名单没问题，是 `workers.dev` 这个域名本身在我这边的网络里走不通。

而 Cloudflare 有个特性救了我：**Worker 可以绑定自定义域**。绑上之后，TLS 握手时的 SNI 变成我自己的域名，不再触发针对 `workers.dev` 的阻断；CF 免费版的单请求时长上限（约 100 秒）也大于生图所需的 ~60 秒。

于是有了 `imgen.wldss.shop`：

```
访客浏览器 → https://imgen.wldss.shop/?url={编码后的接口地址} → 任意生图接口
```

![三格漫画：workers.dev 在路障前被墙，换上 wldss.shop 后顺利通过检查站](/media/blog/ai-image-gen-postmortem/02-workers-domain-minicomic.avif)

Cloudflare 自动加 DNS 记录、自动签证书，两分钟生效。这一步之后，**公开可用、不依赖我本机、不依赖 workers.dev** 三个目标同时达成。

还有一个容易忽略的工程细节：老访客的 localStorage 里存着旧的 workers.dev 默认值。如果直接改 HTML 默认值，会被旧存储覆盖回去（我就被这个坑过一次——「明明改了默认值，为什么我浏览器里还是空的？」）。正确姿势是**配置版本号 + 迁移**：

```js
const CONFIG_VERSION = 3;
if (c.configVersion === CONFIG_VERSION) {
  // 新版：用户改过就尊重（包括故意清空）
} else {
  // 旧版：把旧的 workers.dev 默认值替换为新域名；用户自定义过的保留
}
```

「默认值升级」和「尊重用户修改」必须同时成立，否则每次改默认值都是一次对老用户的背刺。

## 4. AI Gateway 弯路：我想要聚合，它给我观测

中途我想把多个 `gpt-image-2` 提供商统一管起来，第一反应是 Cloudflare AI Gateway。这里把两个概念讲清楚，能省别人一天时间。

**Provider slug** 是自定义提供商在网关里的路由标识符，体现在调用地址里：

```
https://gateway.ai.cloudflare.com/v1/{账户ID}/{网关名}/custom-wisart/images/generations
```

网关按路径里的 slug 决定转发到哪个 Base URL。配置本身不难，难的是我发现它**不是我要的东西**：

| 能力 | Cloudflare AI Gateway | sub2api / one-api 类 |
|---|---|---|
| 选哪个提供商 | URL 路径写死，客户端自己决定 | 按模型名自动匹配渠道池 |
| 同模型多渠道负载均衡/失败切换 | ❌ | ✅ 核心能力 |
| 渠道健康检查、熔断 | ❌ | ✅ |
| 发自己的虚拟 Key、配额、计费 | ❌（密钥透传或 BYOK 存储） | ✅ 核心能力 |
| 部署形态 | 免运维 Serverless | 要自己养服务器 |

一句话：**AI Gateway 是「流量观测网关」——你调用别人时中间加一层日志/缓存/限流；sub2api 是「渠道池调度器」——你只说模型名，它决定这次用哪家、挂了换哪家。** 我要的是后者，于是网关建了又删，老老实实回到「relay Worker + 页面里换 Base URL」的朴素方案。

![小象把写有“调度?”的蓝图丢进废纸篓：观测塔只是让请求直穿过去，没有分流能力](/media/blog/ai-image-gen-postmortem/03-ai-gateway-built-and-deleted.avif)

**选型前先问「它解决的问题是不是我的问题」，比研究怎么配置重要得多。**

## 5. 网络探案：谁杀了我的 60 秒连接

这是整个项目里最像侦探故事的一段。

### 5.1 症状

我在自己浏览器里生图，稳定报错「请求被浏览器拦截或网络失败」。但同一时刻，短请求（模型列表，1 秒返回）永远成功。

### 5.2 线索一：系统代理

查机器配置，发现开着系统代理 `127.0.0.1:1082`——Shadowrocket 类工具的典型端口。也就是说我浏览器的所有请求实际走的是：

```
Chrome → Shadowrocket(1082) → 机场节点 → Cloudflare 边缘 → 生图接口
```

### 5.3 线索二：实验矩阵

我做了一组对照实验，把变量一个个钉死：

| 实验 | 环境 | 结果 |
|---|---|---|
| A | 系统代理 + workers.dev | ❌ 长请求 60~80s 处被掐（= 用户报错） |
| B | 系统代理 + 本地中转 | ❌ ~40s 被断 |
| C | 无代理直连 workers.dev | ❌ TLS 秒被 SNI 重置 |
| D | curl 直连生图接口 | ✅ 58s 稳定成功 |

规律清晰得可怕：**短请求永远活，长请求必死；curl 能活，Node/浏览器的 fetch 会死。**

![小象拿着放大镜查看一根被剪断的 60 秒连接线，背景是代理节点](/media/blog/ai-image-gen-postmortem/04-who-killed-60s-connection.avif)

### 5.4 真相

生图接口的特点是：请求发出后，服务端要闷头算约 60 秒才一次性返回，期间连接上**没有任何数据流动**。而机场节点普遍对单条连接有空闲/总时长上限（免费或拥挤节点尤其如此），60 秒静默正好踩线。不是 Shadowrocket 这个 App 在杀连接，是它背后的节点在杀。

解法不是关代理，而是给生图相关域名加**直连规则**：

```
DOMAIN-SUFFIX, kuaileshifu.com, DIRECT
DOMAIN, imgen.wldss.shop, DIRECT
```

加完规则，连接稳稳撑过 100 秒。其他上网习惯完全不受影响。

顺带，因为实测「curl 稳定、fetch 不稳」，本地中转干脆重构成纯 curl 通道——既然实现本来就是整包缓冲，没用上流式优势，那就选实测更稳的那条腿。有人问「用 curl 还需要 CORS 吗？」：**curl 跑在中转进程里，那段是服务器间通信，本来就没有 CORS；浏览器到中转那一跳的 CORS 头，中转自己返回就行。** 两段各论各的。

### 5.5 最重要的批评：你的测试和我用的路径不一致

排查中用户（也就是我自己作为真实用户的那一面）提出了一句致命批评：

> 「你测试和我使用的路径都不一致的。」

确实。无头测试浏览器没有我的真实 profile、扩展、系统代理、localStorage 历史配置。我复现得再漂亮，也不等于用户的浏览器里能通。

于是我给页面加了**精确诊断**：任何失败，状态栏直接打印「实际请求的完整 URL + 浏览器原始错误 + 常见原因清单」：

```
生成请求失败。
实际请求：https://imgen.wldss.shop/?url=https%3A%2F%2F...
浏览器错误：Failed to fetch
常见原因：① 代理不可用或被网络拦截；② Base URL 不对；③ 密钥无效被拒后的 CORS 挡板；④ 浏览器插件/系统代理干扰。
```

**让用户的浏览器自己报告断点，比我在外面猜十轮都准。** 这条原则后来成了这个工具的固定设计：错误信息必须包含「实际发出去的请求」，因为配置经过中转模板拼接后，用户看到的 Base URL 和浏览器真正请求的地址可能完全不同。

## 6. 多 provider 兼容：每家都有自己的脾气

链路稳定后，我接了两个真实 provider 做全链路实测，收获了一本「接口怪癖图鉴」。

![不同生图服务商对模型列表、返回格式、参考图编辑和错误处理各有差异](/media/blog/ai-image-gen-postmortem/05-provider-compatibility-illustration.avif)

| | wisart | 噜皮 test.mlgb7.com |
|---|---|---|
| 模型列表 | ✅ 5 个模型 | ✅ 12 个（含 gpt-image-2） |
| 文生图返回格式 | `b64_json` | **只支持 `url`** |
| 参考图编辑 `/images/edits` | ✅ | ❌ 服务端 502（文档写了但没实现好） |
| 业务层怪事 | `500: 没有可用 token`（上游池/点数问题） | `400: 仅支持 response_format=url` |

三个代表性坑：

**① 硬编码 `response_format` 的代价。** 参考图链路里我一开始强制 `response_format=b64_json`（为了下载稳定）。噜皮直接 400：「本站用户 API 目前仅支持 response_format=url」。修法是**干脆不强制这个参数，交给服务端默认**——反正结果展示和下载对 `b64_json` 与 `url` 两种格式都兼容：b64 解码成 Blob，url 先 `fetch` 成 Blob、失败再经中转重试、再不行降级提示手动保存。

**② 返回 url 的下载链要比 b64 多考虑两跳。** 图床 URL 往往不带 CORS 头，浏览器直取会失败。所以 url 结果的自动下载是：直连 fetch → 失败走用户配置的中转再试 → 仍失败就把控制权交还用户（「下载图片 / 查看原图」按钮），绝不静默失败。

**③ 业务错误和网络错误要分开说。** `500: 没有可用 token` 是 provider 账户侧的问题，`Failed to fetch` 才是链路问题。早期我把它们混在一句「网络失败」里，用户拿着它去查网络，白白浪费一小时。现在 HTTP 错误会带上状态码、服务端原始 message 和实际请求地址，网络错误才走 CORS 话术。

**写兼容层的第一原则：不要替服务端做假设。** 不假设返回格式、不假设路径单复数、不假设错误语义——全都做兼容，全都把原始信息露出来。

## 7. 体验迭代与「无依赖 E2E」

功能通了之后是体验三轮迭代：生成成功后**自动触发下载**；模型列表从原生 `<datalist>` 换成**自定义下拉**（datalist 在多数浏览器里点击不弹、不能滚动筛选，「获取了模型却选不了」就是它干的）；页面改成**左右两栏**——左参数、右结果（桌面右栏 sticky 常驻，移动端回落单列）；结果底部按参考设计做了参数胶囊：`查看原图 | 下载图片 | 图片尺寸 W×H | 图片大小`。

自定义下拉的交互细节值得抄：获取后自动展开全部模型；输入时实时过滤；键盘 ↑↓/Enter/Esc 全支持；外部点击收起；当前模型打 ✓；选项用 `mousedown preventDefault` 防止「点击前输入框失焦把菜单收掉」的经典 race。

验证手段也进化成了一套**零依赖 CDP 冒烟测试**：Node 22 自带全局 `WebSocket`，不需要 puppeteer/playwright，直接连 Chrome 的 `--remote-debugging-port`：

- `Page.addScriptToEvaluateOnNewDocument` 里 stub 掉 `window.fetch`，伪造模型列表和生图响应，顺便**捕获实际发出的 FormData**，断言「不再包含 response_format」；
- `DOM.setFileInputFiles` 给文件输入框塞真实图片，走一遍真的参考图上传链路；
- `HTMLAnchorElement.prototype.click` 打桩，断言自动下载真的触发、文件名形如 `image-gen-*.png`；
- `Emulation.setDeviceMetricsOverride` 切 420px 视口，断言移动端单列堆叠。

十二项断言全绿才允许提交。这套脚本每次改动后跑一遍，把「我以为修好了」变成「机器证明修好了」。

## 8. 收工：坑清单与心得

把三个会话的坑浓缩成一份清单，送给想在纯静态站上做重交互工具的你：

1. **CORS 是浏览器机制，中转是服务器间通信**——两段各论各的，中转必须流式透传二进制。
2. **`workers.dev` 可能被针对性阻断，Worker 自定义域是免费解药**（SNI 变成你自己的域名）。
3. **默认值升级要做配置版本迁移**，并且尊重用户手动改过的值（包括故意清空）。
4. **原生控件是 i18n 和交互的飞地**：`<option>` 塞不进 span，`<datalist>` 点击不弹——该自定义就自定义。
5. **headless Chrome 有最小窗口宽度**，小视口验证请用 Emulation 域。
6. **代理软件会杀长连接**：60 秒静默的生图请求是典型受害者，DIRECT 规则比关代理更优雅。
7. **curl 和 fetch 在同一条网络里可能命运不同**，实测说了算，文档说了算的只有协议格式。
8. **AI Gateway ≠ 渠道池**：要观测选它，要聚合分发选 one-api 类，别建了再删。
9. **错误信息必须带「实际请求地址 + 原始错误」**，让用户的浏览器自己报告断点。
10. **不替服务端做假设**：返回格式、路径、错误语义全兼容，业务错误和网络错误分开说。
11. **有一份 DEVLOG 当跨会话记忆**——三个会话隔了几天，靠它无缝接续，比任何「项目文档」都实用。

最后，这个工具现在安静地跑在 GitHub Pages 上：纯静态、零后端、密钥不出访客浏览器，一个 Cloudflare Worker 自定义域撑起所有人的中转。回头看，需求文档里那行「浏览器直连，全部在客户端完成」，其实是一份战书。

打完收工。

---

*工具已上线：个人站工具区「[AI 生图](/tools/image-gen/)」。兼容任意 OpenAI 兼容图片接口，配置只存你自己的浏览器。*
