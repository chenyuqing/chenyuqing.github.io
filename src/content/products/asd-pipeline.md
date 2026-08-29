---
name: "ASD Pipeline"
title: "ASD Pipeline"
tagline: "离线说话人检测 macOS 应用：焦点跟随与竖屏裁剪，下载即用"
description: "把 LR-ASD 说话人检测打包成开箱即用的 macOS 应用：内置完整离线引擎（PyTorch / OpenCV / ffmpeg），无需 Python 环境。支持说话人焦点跟随（停顿保持）、9:16 竖屏裁剪与结构化结果输出。"
status: "beta"
type: "ai-tool"
featured: false
pinned: false
repo: "https://github.com/chenyuqing/asd-pipeline"
download: "https://github.com/chenyuqing/asd-pipeline/releases/download/app-v0.2.5/ASD-Pipeline-v0.2.5-arm64.dmg"
downloadVersion: "0.2.5 (build 16)"
downloadSize: "约 326 MB"
illo: "/media/illo/products/asd-pipeline.avif"
icon: "/media/products/asd-pipeline/app-icon.avif"
docs: "README"
platform: "macOS 13+ · Apple Silicon"
audience: "需要本地点视频找说话人、做竖屏裁剪的视频创作者与工作流开发者"
pubDate: 2026-05-02
updatedDate: 2026-08-29
tags: ["Active Speaker Detection", "Video Analysis", "Local AI", "Offline"]
stack: ["Python", "LR-ASD", "PyTorch", "OpenCV", "FFmpeg"]
relatedPosts: ["pi-active-speaker-detection"]
highlights:
  - title: "离线引擎，下载即用"
    description: "内置 PyTorch、OpenCV、LR-ASD 与 ffmpeg 完整运行时，安装后不需要 Python 环境、不联网、不上传视频，Apple Silicon 上开箱即用。"
    illo: "/media/illo/products/asd-feature-staged.avif"
  - title: "说话人焦点跟随"
    description: "基于帧级说话人概率跟随当前说话人：短暂停顿保持焦点，连续强证据才切换，避免画面来回跳切。"
    illo: "/media/illo/products/asd-feature-resume.avif"
  - title: "竖屏裁剪与结构化输出"
    description: "按焦点轨迹导出以说话人为中心的 9:16 竖屏视频并回灌原音轨；中间结果落成结构化 JSON，可复核、可接下游。"
    illo: "/media/illo/products/asd-feature-structured.avif"
gallery:
  - src: "/media/products/asd-pipeline/ui-main.avif"
    alt: "ASD Pipeline 主界面：时间区间输入、S3FD 检测后端设置，左侧检测预览标出说话人，右侧同步预览竖屏成片"
    caption: "单视频模式：设定起止时间一键处理。左侧检测预览实时标出说话人（绿框为当前说话人），右侧同步预览 9:16 竖屏成片（含原声）。"
draft: false
---

原始的 ASD 基线更像一次性研究脚本：环境重、恢复弱、结果不透明。ASD Pipeline 把 LR-ASD 整理成阶段式、可恢复的本地引擎，并在这个引擎之上提供了开箱即用的 macOS 应用——下载一个 DMG，拖进 Applications，就拥有完整的离线说话人检测能力。

应用内置完整运行时（PyTorch / OpenCV / LR-ASD / ffmpeg），不需要 Python 环境、不联网、不上传视频。核心流程：检测画面中的人脸与说话概率，跟随当前说话人的焦点（短暂停顿保持，连续强证据才切换），并按焦点轨迹导出以说话人为中心的 9:16 竖屏视频，原音轨自动回灌。

除了图形界面，同一引擎也提供 CLI 与 Web API（`/run`、`/run-pipeline`、`/run-tracked`），每次运行输出 tracks、frame scores、predictions 等结构化 JSON 工件，适合作为下游视频理解与字幕工作流的能力模块。
