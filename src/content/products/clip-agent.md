---
name: "Clip Agent Studio"
title: "Clip Agent Studio"
tagline: "AI 挑高光、自动裁竖屏的本地剪辑工作台，6 个社交平台一键适配"
description: "AI 驱动的桌面剪辑工作台：基于字幕内容分析识别黄金片段，YOLOv11n 人物跟踪智能裁剪，输出适配 TikTok / Instagram / YouTube Shorts / Threads / 小红书 / Twitter 的竖屏视频。视频处理全程本机完成，LLM 分析支持自配 DeepSeek / Gemini API。"
status: "live"
type: "media-tool"
featured: true
pinned: false
order: 2
download: "https://github.com/chenyuqing/chenyuqing.github.io/releases/download/clip-agent-studio-v0.5.1/Clip-Agent-Studio-v0.5.1-arm64.dmg"
downloadVersion: "0.5.1"
downloadSize: "约 473 MB"
illo: "/media/illo/products/clip-agent.avif"
icon: "/media/products/clip-agent/app-icon.avif"
gallery:
  - src: "/media/products/clip-agent/ui-main.avif"
    alt: "Clip Agent Studio 主界面：左侧五步流程（导入素材、分析高光、选择片段、生成竖屏、结果预览），右侧素材导入与 OpenAI 兼容 API 配置"
    caption: "五步工作流：导入视频与 SRT/VTT 字幕 → 自配 OpenAI 兼容 LLM 分析高光 → 选择片段 → ASD 智能跟随生成竖屏 → 结果预览。视频留在本机，仅字幕文本发送给你指定的 LLM API。"
docs: "README"
platform: "macOS 13+ · Apple Silicon"
audience: "内容创作者、短视频运营、播客剪辑、社交媒体团队"
pubDate: 2026-05-20
updatedDate: 2026-08-29
tags: ["Video Clipping", "AI Analysis", "Social Media", "YOLOv11n", "Smart Crop"]
stack: ["Electron", "React", "Python", "FastAPI", "FFmpeg", "YOLOv11n"]
relatedPosts: ["pi-active-speaker-detection", "pi-voxcpm-dubbing"]
highlights:
  - title: "AI 高光识别"
    description: "基于字幕内容做多模型 LLM 分析（支持自配 DeepSeek / Gemini API），按平台偏好选出最具传播力的片段，并给出智能平台推荐。"
    illo: "/media/illo/products/ca-feature-highlights.avif"
  - title: "智能人形跟踪裁剪"
    description: "YOLOv11n 模型内置集成、本地运行：动态视频面积优先、静态视频位置优先，ASD 命中时直接跟说话人，短时缺失时保持视觉跟踪。"
    illo: "/media/illo/products/ca-feature-tracking.avif"
  - title: "6 平台一键适配"
    description: "TikTok / Instagram / YouTube Shorts / Threads / 小红书 / Twitter 全覆盖：自动适配时长、宽高比与分辨率，4K 智能下采样到 2K，处理速度提升 4 倍。"
    illo: "/media/illo/products/ca-feature-platforms.avif"
draft: false
---

Clip Agent Studio 解决的核心问题是：长视频里有价值的内容，手动剪成短视频太慢。它把「看长视频 → 找高光 → 裁竖屏 → 适配平台」整条链路收进一个 macOS 应用：内置 Python 后端、YOLOv11n 检测模型和完整 FFmpeg 运行时，视频处理全程本机完成，不上传视频。

AI 字幕分析与脚本生成基于 LLM（支持 DeepSeek、Gemini 等自配 API），把高光挑选、平台推荐和竖屏裁剪串成一次提交。本页提供预构建的 macOS 应用下载；源码仓库保持私有。
