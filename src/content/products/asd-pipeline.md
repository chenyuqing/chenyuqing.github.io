---
name: "ASD Pipeline"
title: "ASD Pipeline"
tagline: "把 Active Speaker Detection 变成可恢复、可测试、可复用的本地能力入口"
description: "一个面向 Apple Silicon 本地验证的 Active Speaker Detection 工作台，把 LR-ASD 从一次性 CLI 运行整理成分阶段、可恢复、可输出结构化工件的基础能力。"
status: "experiment"
type: "ai-tool"
featured: false
pinned: false
repo: "https://github.com/chenyuqing/asd-pipeline"
illo: "/media/illo/products/asd-pipeline.png"
docs: "README"
platform: "macOS / Apple Silicon"
audience: "视频理解实验、说话人分析、字幕与多模态工作流开发者"
pubDate: 2026-05-02
updatedDate: 2026-05-02
tags: ["Active Speaker Detection", "Video Analysis", "Local AI", "Pipeline"]
stack: ["Python", "LR-ASD", "FFmpeg", "PyTorch", "MPS"]
relatedPosts: ["pi-active-speaker-detection"]
highlights:
  - title: "阶段式运行"
    description: "把 extract、detect、track、score、render 拆成显式阶段，便于局部调试和定位问题。"
    illo: "/media/illo/products/asd-feature-staged.png"
  - title: "恢复与复用"
    description: "支持从中间工件恢复、跳过已有阶段、强制重跑指定阶段，适合离线实验流程。"
    illo: "/media/illo/products/asd-feature-resume.png"
  - title: "结构化结果"
    description: "统一产出 tracks、frame scores、predictions 等 JSON 工件，便于后续分析和集成。"
    illo: "/media/illo/products/asd-feature-structured.png"
draft: false
---

原始的 ASD 基线常常更像一次性研究脚本：整跑重、恢复弱、中间状态不透明。这个项目的价值不在于换了一个新模型，而在于把整条流程拆成清晰阶段，并把结果落成结构化 JSON。

每次运行会输出 tracks.json、frame_scores.json、predictions.json、metrics.json 和 validation_overlay.mp4，比单纯"跑出一个可视化视频"更适合作为下游能力模块。
