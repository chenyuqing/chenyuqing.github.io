---
name: "Subtitle Maker"
title: "Subtitle Maker"
tagline: "本地完成字幕、翻译、配音与成片导出的 Mac 工作台"
description: "一个面向 Apple Silicon 的本地 AI 字幕与配音工具，把转写、翻译、配音、字幕预览和最终导出收进一个连续工作流。"
status: "beta"
type: "media-tool"
featured: true
pinned: true
repo: "https://github.com/chenyuqing/subtitle-maker/tree/codex/omnivoice-speaker-upload-milestone-20260507"
demo: "http://localhost:8000"
demoLabel: "本地 Demo"
illo: "/media/illo/products/subtitle-maker.png"
docs: "README"
platform: "macOS (Apple Silicon)"
audience: "视频创作者、播客剪辑、字幕翻译与配音工作流用户"
pubDate: 2026-05-07
updatedDate: 2026-05-07
tags: ["Local AI", "Subtitles", "Dubbing", "Video Workflow"]
stack: ["Python", "Qwen3-ASR", "FFmpeg", "OpenAI Compatible", "OmniVoice", "VoxCPM"]
relatedPosts: ["pi-voxcpm-dubbing", "pi-hard-subtitle-extraction", "pi-seed-vc-voice-cloning"]
highlights:
  - title: "本地优先"
    description: "转写在本机完成，减少敏感音频上传，适合需要更强隐私边界的工作流。"
    illo: "/media/illo/products/sm-feature-local.png"
  - title: "一条链路走完"
    description: "从视频上传、字幕识别、翻译到配音和成片导出，都在同一个工作台里完成。"
    illo: "/media/illo/products/sm-feature-pipeline.png"
  - title: "面向真实生产"
    description: "支持长视频、SRT 导入、时间区间处理、断点恢复和最终 MP4/ASS/SRT 输出。"
    illo: "/media/illo/products/sm-feature-output.png"
draft: false
---

传统字幕流程往往分散在多个工具里：识别一个、翻译一个、配音一个、成片又是另一个。Subtitle Maker 的核心思路，是把这些断裂步骤重新组织成一个连续界面，让用户更少处理"工具切换"，更多处理"内容结果"。

最终可导出原文 / 译文 / 双语字幕文件、styled ASS 字幕、纯换音轨 MP4 和烧录字幕后的最终 MP4，适合需要直接交付结果的工作流。
