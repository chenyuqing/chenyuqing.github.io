---
name: "VoiceWave Profile"
title: "VoiceWave Profile"
tagline: "输入照片和录音，自动生成带音波动画的 9:16 竖屏头像视频"
description: "一个专为播客和短视频设计的音波头像视频生成工具。自动检测人脸区域，实时分析音频特征，生成带音波可视化和 5 种视觉风格的 9:16 视频，支持透明背景输出便于后期合成。"
status: "experiment"
type: "media-tool"
featured: false
pinned: false
order: 4
repo: "https://github.com/chenyuqing/voicewave_profile/tree/feature/podcast-automation"
illo: "/media/illo/products/voicewave-profile.avif"
docs: "README"
platform: "macOS / Linux"
audience: "播客创作者、短视频博主、内容团队需要自动化头像视频的人"
pubDate: 2026-06-15
updatedDate: 2026-07-01
tags: ["Audio Visualization", "Face Detection", "Podcast", "9:16 Video"]
stack: ["Python", "FFmpeg", "OpenCV", "uv"]
relatedPosts: ["pi-voxcpm-dubbing"]
highlights:
  - title: "智能人脸裁剪"
    description: "自动检测照片中最佳人脸区域并裁剪为头像，不需要手动调整位置和比例。"
    illo: "/media/illo/products/vw-feature-face.avif"
  - title: "音频同步动画"
    description: "实时分析音频特征，音波动画与语音节奏同步，让头像视频有呼吸感而不只是静态图。"
    illo: "/media/illo/products/vw-feature-audio.avif"
  - title: "5 种视觉风格"
    description: "elegant 优雅绿 / dynamic 动感粉 / minimal 简约白 / cyber 赛博朋克 / ocean 海洋蓝，覆盖不同内容调性。"
    illo: "/media/illo/products/vw-feature-styles.avif"
draft: false
---

传统播客短片需要一个静态头像 + 一段录音，手动在剪辑软件里做音波动画。VoiceWave Profile 把这件事自动化：输入一张照片和一段音频，自动检测人脸、生成音波动画、合成 9:16 竖屏视频，输出支持透明背景便于后期叠加。
