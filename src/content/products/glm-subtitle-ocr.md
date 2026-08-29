---
name: "GLM Subtitle OCR"
title: "GLM Subtitle OCR"
tagline: "视频硬字幕本地 OCR 提取：GLM-OCR 识别，导出 SRT"
description: "SwiftUI 原生 macOS 应用：对视频硬字幕智能截帧，用智谱开源 GLM-OCR（0.9B 多模态 OCR 模型）识别字幕文本，按时间戳对齐导出 SRT。可接 Ollama 本地推理或 GLM API，视频全程留在本机。"
status: "beta"
type: "media-tool"
featured: false
pinned: false
order: 6
download: "https://github.com/chenyuqing/chenyuqing.github.io/releases/download/glm-subtitle-ocr-v0.1.17/GLM-Subtitle-OCR-v0.1.17-arm64.dmg"
downloadVersion: "0.1.17"
downloadSize: "约 60 MB"
icon: "/media/products/glm-subtitle-ocr/app-icon.avif"
platform: "macOS 13+ · Apple Silicon"
audience: "给无字幕素材补 SRT、整理下载视频与本地字幕库的创作者和剪辑流程"
pubDate: 2026-08-29
updatedDate: 2026-08-29
tags: ["OCR", "Subtitles", "Local AI", "GLM"]
stack: ["SwiftUI", "Python", "PyInstaller", "GLM-OCR", "Ollama"]
relatedPosts: ["pi-hard-subtitle-extraction"]
highlights:
  - title: "硬字幕 → SRT"
    description: "对视频画面智能截帧，识别烧录在画面里的字幕文本，按时间戳对齐合并，直接导出可用的 SRT 字幕文件。"
  - title: "GLM-OCR 驱动"
    description: "基于智谱开源 GLM-OCR（0.9B 多模态 OCR 模型），支持通过 Ollama 本地推理或 GLM API 调用，识别准确率高。"
  - title: "原生 macOS，视频不出本机"
    description: "SwiftUI 原生壳 + 内置 Python 后端，下载拖入即用、不依赖 Python 环境；视频全程留在本机，只有截帧图像送给你选择的识别端点。"
draft: false
---

下载视频、无声素材、历史资料片——画面里明明有字幕，却拿不到字幕文件。GLM Subtitle OCR 把「截帧 → OCR → 时间戳对齐 → SRT」这条链路做成一个原生 Mac 应用：内置 Python 后端，接上 GLM-OCR（Ollama 本地推理或 GLM API）就能批量把硬字幕变成可编辑的 SRT。

模型底座是智谱开源的 GLM-OCR（0.9B 参数，OmniDocBench V1.5 第一），复杂画面下的字幕识别足够稳。整套能力线来自我在本地字幕工作流里的真实需求，方法论见相关文章。
