---
name: "GLM Subtitle OCR"
title: "GLM Subtitle OCR"
tagline: "把画面里的硬字幕拖回来：本地 OCR，生成帧级 SRT"
description: "SwiftUI 原生 macOS 应用：拖入视频、框选字幕区域，用智谱开源 GLM-OCR（0.9B）在 Apple Silicon 上以 MLX 本地推理识别字幕，时间来自视频帧、文字来自本地 OCR，导出帧级 SRT + 诊断 JSONL。视频与推理全程留在本机。"
status: "beta"
type: "media-tool"
featured: false
pinned: false
order: 6
download: "https://github.com/chenyuqing/chenyuqing.github.io/releases/download/glm-subtitle-ocr-v0.1.17/GLM-Subtitle-OCR-v0.1.17-arm64.dmg"
downloadVersion: "0.1.17"
downloadSize: "约 60 MB"
icon: "/media/products/glm-subtitle-ocr/app-icon.avif"
gallery:
  - src: "/media/products/glm-subtitle-ocr/ui-main.avif"
    alt: "GLM Subtitle OCR 主界面：拖入视频、框选字幕区域，右侧输出设置、识别质量（快速/平衡/精细）与本地 GLM-OCR MLX 推理服务状态"
    caption: "主界面：拖入视频、画出字幕区域，一键启动本地 GLM-OCR（MLX Metal）生成帧级 SRT；识别质量三档可调，输出自动与视频同名。"
platform: "macOS 13+ · Apple Silicon"
audience: "给无字幕素材补 SRT、整理下载视频与本地字幕库的创作者和剪辑流程"
pubDate: 2026-08-29
updatedDate: 2026-08-29
tags: ["OCR", "Subtitles", "Local AI", "GLM"]
stack: ["SwiftUI", "Python", "PyInstaller", "GLM-OCR", "MLX"]
relatedPosts: ["pi-hard-subtitle-extraction"]
highlights:
  - title: "硬字幕 → 帧级 SRT"
    description: "拖入视频、画出字幕区域，时间来自视频帧、文字来自本地 OCR；一条字幕只识别必要的帧，导出可编辑 SRT，附诊断 JSONL。"
  - title: "Apple Silicon 本地推理"
    description: "内置 GLM-OCR（0.9B 多模态 OCR 模型）MLX Metal 推理服务，一键启动、全程离线；识别质量三档可调：快速 4fps / 平衡 6fps / 精细 8fps。"
  - title: "原生 macOS，隐私优先"
    description: "SwiftUI 原生壳 + 内置 Python 后端，下载拖入即用、不依赖 Python 环境；视频与推理全程留在本机。"
draft: false
---

下载视频、无声素材、历史资料片——画面里明明有字幕，却拿不到字幕文件。GLM Subtitle OCR 把「截帧 → OCR → 时间戳对齐 → SRT」这条链路做成一个原生 Mac 应用：拖入视频、画出字幕区域，本地 GLM-OCR（MLX Metal 推理）只识别必要的帧，直接吐出帧级 SRT。

模型底座是智谱开源的 GLM-OCR（0.9B 参数，OmniDocBench V1.5 第一），在 Apple Silicon 上跑 MLX 推理，全程离线。整套能力线来自我在本地字幕工作流里的真实需求，方法论见相关文章。
