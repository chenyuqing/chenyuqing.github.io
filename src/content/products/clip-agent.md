---
name: "Clip Agent"
title: "Clip Agent"
tagline: "从长视频自动识别高光片段，裁成适合 6 个社交平台的竖屏短视频"
description: "一个 AI 驱动的智能视频剪辑工具，基于字幕内容分析识别黄金片段，用 YOLOv11n 人形跟踪做智能裁剪，输出适配 TikTok / Instagram / YouTube Shorts / Threads / 小红书 / Twitter 的竖屏视频。"
status: "live"
type: "media-tool"
featured: true
pinned: false
order: 2
repo: "https://github.com/chenyuqing/clip_agent_2/tree/lrasd-focus-cropping"
illo: "/media/illo/products/clip-agent.png"
docs: "README"
platform: "macOS / Linux / Docker"
audience: "内容创作者、短视频运营、播客剪辑、社交媒体团队"
pubDate: 2026-05-20
updatedDate: 2026-07-01
tags: ["Video Clipping", "AI Analysis", "Social Media", "YOLOv11n", "Smart Crop"]
stack: ["Python", "React", "FastAPI", "FFmpeg", "YOLOv11n", "Gemini API", "Ollama"]
relatedPosts: ["pi-active-speaker-detection", "pi-voxcpm-dubbing"]
highlights:
  - title: "AI 高光识别"
    description: "基于字幕内容做多模型 AI 分析，按平台偏好不同信号选出最具传播力的片段。YouTube 看知识密度，TikTok 看情绪爆点，小红书看实用经验。"
    illo: "/media/illo/products/ca-feature-highlights.png"
  - title: "智能人形跟踪裁剪"
    description: "YOLOv11n + IoU 轻量跟踪算法，动态视频面积优先、静态视频位置优先。ASD 命中时直接跟说话人，短时缺失时继续视觉跟踪上一说话人。"
    illo: "/media/illo/products/ca-feature-tracking.png"
  - title: "6 平台一键适配"
    description: "TikTok / Instagram / YouTube Shorts / Threads / 小红书 / Twitter 全覆盖，4K 智能下采样到 2K，自动适配时长、宽高比和分辨率。"
    illo: "/media/illo/products/ca-feature-platforms.png"
draft: false
---

Clip Agent 解决的核心问题是：长视频里有价值的内容，手动剪成短视频太慢。它把"看长视频 → 找高光 → 裁竖屏 → 适配平台"这条链路自动化，让创作者从几个小时的手动剪辑缩短到一次提交。

除了 Web 界面，还提供 Agent CLI：直接给 Claude Code、Codex 这类 agent 调用，stdout 只输出 summary.json，适合串进自动化工作流。
