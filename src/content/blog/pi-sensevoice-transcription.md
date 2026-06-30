---
title: "我把本地语音识别接进了 AI 编程助手，全程踩坑实录"
description: "把阿里开源的 SenseVoice 语音识别模型接进 pi，实现本地一键转录，附两个关键 bug 修复。"
pubDate: 2026-06-02
tags: ["AI Agent", "语音识别"]
verdict: "trial"
series: "pi-coding-agent"
draft: false
---

10 个视频，手动上传转录工具。

等待、下载、再上传——半小时过去了，内容还没到手。

更麻烦的是：敏感内容不想过云端。

所以我做了一件事：**把 SenseVoice 这个本地语音识别模型，直接接进 AI 编程助手 pi 的工具系统里。**

说一句话，AI 自动调用，转录结果直接回到对话，后续接着做总结、翻译、写文章——全程不离开工作流。

过程踩了不少坑，一起记下来。

---

## pi 是什么？不只是"另一个 Cursor"

很多人用过 Claude Code、Cursor、Windsurf。

pi 看起来是同类——但有一个根本差异：

**它是完全开放的 AI agent 平台，不是封闭的产品。**

具体说四件事：

**▎支持接入任意模型**
Claude、GPT、Gemini、本地开源模型，配置文件一行切换。不被任何厂商锁定，今天用 Claude 做推理，明天换 GPT-5 跑代码，随时迁移。

**▎支持注册自定义工具**
放一个 TypeScript 文件到 `~/.pi/agent/extensions/`，pi 启动时自动加载。AI 就能在对话中直接调用这个工具——调本地脚本、请求 API、操作文件系统、执行 shell 命令，都行。

**▎支持非交互批处理**
`pi --print` 模式，可以直接在终端把 pi 当命令行工具用。嵌进 shell 脚本、CI 流程、定时任务——AI 能力变成可编排的管道。

**▎完全本地运行**
没有强制云同步，没有数据上传。模型和工具全在自己机器上跑。

这次要用的，就是「自定义工具」这个能力。

---

## SenseVoice：最值得本地部署的语音识别模型之一

阿里达摩院开源，Small 版本几百 MB，支持中英日韩粤五种语言，识别速度极快。

目标很简单：把它包装成 pi 的一个工具，让 AI 直接说"帮我转录这个视频"，工具自动跑，结果返回上下文。

三步搞定。

---

## Step 1｜建独立 Python 环境

SenseVoice 依赖 funasr，要求 Python 3.10+。

我没有复用已有项目的虚拟环境，而是单独给 pi 建了一个干净的环境。

原因很简单：**项目的依赖会变，工具的依赖要稳定。**

用 uv 创建（自带 Python 版本管理，比 venv 快一个数量级）：

```bash
uv venv ~/.pi/agent/sensevoice/venv --python 3.11
uv pip install funasr torch torchaudio \
  --python ~/.pi/agent/sensevoice/venv/bin/python
```

装完 81 个包，核心只有 funasr + torch，干净。

---

## Step 2｜写转录脚本

新建 `~/.pi/agent/sensevoice/transcribe.py`，接收音频路径和语言参数，输出 JSON：

```python
from funasr import AutoModel

model = AutoModel(
    model="iic/SenseVoiceSmall",
    disable_update=True,
    log_level="ERROR",
)
res = model.generate(input=audio_path, language=language, use_itn=True)
text = res[0]["text"].split("|>")[-1].strip()
print(json.dumps({"text": text, "language": lang}))
```

> SenseVoice 返回格式是 `<语言标记>|>实际文字`，取最后一段即可。

**💥 坑一：stdout 被 funasr 污染**

funasr 在 import 时会往 stdout 打印版本信息，导致 `JSON.parse` 直接失败，工具崩溃。

修复：import 之前把 stdout 临时重定向到 stderr：

```python
_real_stdout = sys.stdout
sys.stdout = sys.stderr  # 把噪音导走

from funasr import AutoModel
# ... 跑模型 ...

sys.stdout = _real_stdout
print(json.dumps(result))  # 干净输出
```

---

## Step 3｜写 pi Extension

新建 `~/.pi/agent/extensions/sensevoice.ts`，注册工具：

```typescript
pi.registerTool({
  name: "transcribe_audio",
  label: "Transcribe Audio",
  description: "Transcribe speech from audio/video using SenseVoice...",
  parameters: Type.Object({
    path: Type.String({ description: "Absolute path to audio/video file" }),
    language: Type.Optional(Type.String({ default: "auto" })),
  }),
  async execute(_toolCallId, params, _signal, onUpdate) {
    onUpdate?.({ content: [{ type: "text", text: "Transcribing..." }] });
    const { stdout } = await execFileAsync(PYTHON, [SCRIPT, params.path, lang]);
    const result = JSON.parse(stdout.trim());
    return {
      content: [{ type: "text", text: `Transcription (${result.language}):\n\n${result.text}` }],
      details: { text: result.text, language: result.language },
    };
  },
});
```

**💥 坑二：onUpdate 格式错了，pi 直接 crash**

第一版写成了 `onUpdate("Transcribing...")`，直接传字符串。

运行后 pi 崩溃，报错：

```
TypeError: Cannot read properties of undefined (reading 'filter')
```

翻源码才发现——pi 的 `onUpdate` 不接受字符串，要传和返回值一样格式的对象：

```typescript
// ❌ 错误写法，直接崩
onUpdate("Transcribing...");

// ✅ 正确写法
onUpdate?.({ content: [{ type: "text", text: "Transcribing..." }] });
```

---

## 验证：跑起来了

用 pi CLI 非交互模式测试：

```bash
pi --print \
  --provider freemodel --model gpt-5.4-mini \
  --tools transcribe_audio --no-builtin-tools \
  "请用 transcribe_audio 工具转录：/path/to/audio.mp4"
```

第一次调用自动下载模型（约 300MB），之后缓存本地，后续秒级响应。

实测：4 分钟的音频，转录时间不到 10 秒。

跑完测试，用 shell 循环批量处理 10 个视频，每个自动生成对应 Markdown 转录文档，再让 AI 接着做总结——整条链路全打通。

---

## 整体架构一眼看清

```
~/.pi/agent/
├── extensions/
│   └── sensevoice.ts     ← pi 自动加载，注册工具
└── sensevoice/
    ├── venv/              ← 独立 Python 3.11 环境（uv 创建）
    └── transcribe.py      ← SenseVoice 调用脚本
```

pi 启动时自动扫描 `extensions/` 目录，零配置，放进去就生效。

---

## Q&A：踩过的坑，一次说清

**Q：工具放进去了，pi 里看不到，怎么排查？**

确认路径正确：`~/.pi/agent/extensions/sensevoice.ts`。

pi 在每次打开 `/model` 菜单时重新扫描 extensions，不需要重启，触发一次刷新即可。如果还没出现，多半是 TypeScript 语法错误——pi 加载报错时会静默失败，不会提示。

---

**Q：运行报 `TypeError: Cannot read properties of undefined (reading 'filter')`？**

`onUpdate` 调用姿势不对，传了字符串而不是对象。正确写法：

```typescript
onUpdate?.({ content: [{ type: "text", text: "处理中..." }] });
```

记得加 `?.` 可选链，避免 onUpdate 未定义时再次报错。

---

**Q：工具返回 `Unexpected token 'u', "funasr vers"... is not valid JSON`？**

funasr import 时往 stdout 打印了版本信息，污染了 JSON 输出。

在 import funasr 之前把 stdout 重定向到 stderr（见 Step 2 代码），问题消失。

---

**Q：系统 Python 是 3.9，funasr 要求 3.10+，怎么办？**

用 uv，一条命令解决，不需要手动装 Python：

```bash
uv venv ~/.pi/agent/sensevoice/venv --python 3.11
```

uv 自动下载并管理指定版本，不污染系统环境。

---

**Q：首次运行很慢，卡在哪里？**

第一次调用时 funasr 自动从 ModelScope 下载 `iic/SenseVoiceSmall`（约 300MB）。

下载后缓存本地，后续不再下载。网络访问 ModelScope 有问题的话，可以手动下载后用本地路径指定模型。

---

**Q：只能转录音频？视频怎么处理？**

视频直接传，不需要先提取音频。funasr 底层自动处理音轨，mp4、mov、avi 全支持。

---

**Q：工具的返回值格式有什么要求？**

`execute` 必须返回包含 `content` 数组的对象，格式：

```typescript
{ content: [{ type: "text", text: "..." }], details: {} }
```

`content` 缺失或为 undefined，pi 渲染层直接崩。`details` 是可选的结构化数据，不显示给用户，可以存转录原文方便后续处理。

---

## 最后说一句

接好之后的体验是：

**在 AI 对话里说"帮我转录这 10 个视频，每个生成一份 Markdown"——然后去喝杯水。**

回来全好了。

本地跑，不过云，隐私安全，速度快。

这才是 AI 工具应该有的样子。

---

> 文中涉及的 pi 为 `@earendil-works/pi-coding-agent`，SenseVoice 为阿里达摩院开源项目。
>
> 有问题欢迎留言，或直接在评论区说你想接入的下一个工具。
