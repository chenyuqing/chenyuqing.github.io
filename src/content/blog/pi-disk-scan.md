---
title: "硬盘快满了，我让 AI 帮我找出问题在哪"
description: "一个硬盘扫描工具，自动找出大文件、开发垃圾、缓存和重复文件，让清硬盘变得足够简单。"
pubDate: 2026-06-08
tags: ["AI Agent", "工具扩展"]
verdict: "adopt"
series: "pi-coding-agent"
draft: false
---

上周收到一个系统提示：启动磁盘空间不足。

我的 Mac Mini M4 是 256GB 的，买来才一年多。

256GB，怎么就不够了？

---

## 硬盘是怎么被吃满的

我打开 macOS 自带的「关于本机」，点进去看存储用量。

系统说：「其他」占了 180GB。

其他是什么？它没告诉我。

这是 macOS 存储分析的一个经典让人抓狂的地方——它告诉你空间不够，但不告诉你谁占的。

以前的处理方式是：下一个 CleanMyMac，扫一遍，删掉它建议删的东西，然后祈祷别把重要文件误删了。

后来我开始做 AI 开发，问题变得更复杂：

每搭一个项目，就会产生一个 `node_modules` 或者 `.venv`。这些依赖目录动辄几百 MB，大的能到 2-3GB。搭了几十个项目，就默默吃掉几十 GB。

你不去找它，它就一直在那里。

---

## 四类问题，四种扫描

想清楚了，硬盘被吃满无非四类来源：

**大文件**——某个视频、某个模型权重文件、某个备份，体积巨大，但你已经忘了它在哪。

**开发垃圾**——`node_modules`、`.venv`、`build`、`__pycache__`……每个项目都会产生，从来不会自动清理。

**临时/缓存**——`~/Library/Caches`、系统日志、崩溃报告，系统自己产生，也不会自己删干净。

**重复文件**——同一份文件存了好几份，分散在不同目录，每一份你都以为是唯一的。

我做了一个工具 `disk_scan`，专门对付这四类情况。

---

## 怎么用的

直接在 pi 里说：

> 「帮我扫一下硬盘，找出占空间的东西」

它会跑四种模式，逐一报告。

**大文件扫描**，按体积从大到小排列：

```
大文件（>100MB），共 15 个：
  8.2 GB    /Users/tim/Documents/vibe-coding/MVP/model/GLM-OCR
  4.1 GB    /Users/tim/Documents/vibe-coding/MVP/VoxCPM/.venv
  2.3 GB    /Users/tim/Downloads/nvidia-keynote.mp4
  ...
```

**开发垃圾目录**，算出每个目录的实际体积：

```
开发垃圾目录，共 23 个，合计 18.4 GB：
  3.2 GB    /Users/tim/my-sys/glm-ocr-local/.venv-mlx
  2.1 GB    /Users/tim/Documents/vibe-coding/project-a/node_modules
  1.8 GB    /Users/tim/Documents/vibe-coding/project-b/.venv
  ...
```

**缓存目录**，一眼看清各个系统目录占了多少：

```
临时/缓存目录，合计 12.1 GB：
  9.4 GB    /Users/tim/Library/Caches
  1.2 GB    /Users/tim/.cache
  0.8 GB    /private/var/folders
  ...
```

**重复文件**，按浪费的空间排序，告诉你哪两份文件内容完全一样：

```
重复文件，共 3 组，可释放约 4.2 GB：
  [2.1 GB x2，可省 2.1 GB]
    /Users/tim/Downloads/backup-2024.zip
    /Users/tim/Documents/archive/backup-2024.zip
  ...
```

---

## 一个设计决定

工具只报告，不删除。

我专门这样设计的。

自动清理工具最大的风险是误删——它不知道哪些文件你还需要，哪些已经过期。节点目录看起来像垃圾，但可能某个项目还在跑。视频文件看起来重复，但可能版本不同。

让工具来找，让人来判断，这个分工更安全。

拿到报告之后，我自己决定删什么，在 Finder 里操作，删完清空废纸篓。全程可控。

---

## 一次扫描的收获

第一次跑完整扫描，发现了几件事：

`~/Library/Caches` 一个人就占了将近 10GB。这是各种 App 的缓存，大部分删掉之后 App 会自动重建，没有风险。

废弃项目的 `.venv` 和 `node_modules` 合计 20GB 出头。这些项目已经不用了，目录却还在。

有一个 4GB 的视频文件存了两份，一份在 Downloads，一份手动备份到了 Documents，内容完全一样。

三类加起来，释放了 30GB 多。

磁盘告警消失了。

---

## 现在的工具合集

| 工具 | 做什么 |
|------|--------|
| `transcribe_audio` | 本地语音转录（SenseVoice） |
| `generate_xiaohongshu_card` | 小红书配图生成 |
| `dub_narration` | 声音克隆配音 + 字幕视频 |
| `vision_analyze` | 本地视觉理解（Qwen3-VL） |
| `manage_services` | 后台服务调度，释放内存 |
| `extract_subtitles` | 硬字幕提取（GLM-OCR） |
| `disk_scan` | 硬盘空间扫描 |

七个工具，各管一块。

---

有时候我想，AI 助手的价值不只是回答问题。

更重要的是，它能帮你把那些「知道该做但一直拖着没做」的事情，变得足够简单，简单到你愿意做。

清硬盘就是这样——不是不知道该清，是懒得去找、懒得去查、懒得一个一个判断。

现在说一句话，它帮我找出来，我扫一眼，删掉，完事。

够了。

---

> 本系列持续更新，记录把各种工具接进 AI 助手 pi 的完整过程。
