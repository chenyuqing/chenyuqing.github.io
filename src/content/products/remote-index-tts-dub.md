---
name: "Remote Index-TTS Dub"
title: "Remote Index-TTS Dub"
tagline: "字幕翻译到配音的原生 macOS 工作台：本地优先，Index-TTS 合成"
description: "原生 macOS 配音工作台：导入视频与 SRT，用自配 OpenAI 兼容 API 翻译、逐句 Review 锁定，再提交给你自建的远程 Index-TTS 服务合成配音。翻译与校对全程在本机完成、不产生远程费用；App 还能通过 SSH 直接启动你的远程服务器并等待健康检查就绪。"
status: "beta"
type: "media-tool"
featured: false
pinned: false
order: 3
download: "https://github.com/chenyuqing/chenyuqing.github.io/releases/download/remote-index-tts-dub-v0.19.1/Remote-Index-TTS-Dub-v0.19.1-arm64.dmg"
downloadVersion: "0.19.1 (build 29)"
downloadSize: "约 2 MB"
illo: "/media/illo/products/remote-index-tts-dub.avif"
icon: "/media/products/remote-index-tts-dub/app-icon.avif"
gallery:
  - src: "/media/products/remote-index-tts-dub/ui-main.avif"
    alt: "Remote Index-TTS Dub 配音工作台主界面：五步工作流侧栏与 LOCAL FIRST 提示，视频/SRT 导入卡片"
    caption: "配音工作台：五步工作流（导入素材 → 生成译文 → 逐句 Review → 启动远程服务 → 配音下载）。LOCAL FIRST——翻译与校对全部本地完成、不产生远程费用，译文锁定后再启动远程服务。"
platform: "macOS 14+ · Apple Silicon"
audience: "给视频配译制语音、自建 Index-TTS 服务的开发者和字幕组流程"
pubDate: 2026-08-29
updatedDate: 2026-08-29
tags: ["Dubbing", "TTS", "Subtitles", "Local First"]
stack: ["SwiftUI", "Python", "FastAPI", "IndexTTS", "FFmpeg"]
relatedPosts: ["pi-voxcpm-dubbing", "pi-seed-vc-voice-cloning"]
highlights:
  - title: "本地优先工作流"
    description: "导入、API 翻译或导入译文、逐句 Review、锁定——全部本地完成，译文自动保存，不产生远程服务器费用；完成本地工作后才需要启动远程服务。"
    illo: "/media/illo/products/rtts-feature-local.avif"
  - title: "远程 Index-TTS 配音服务"
    description: "App 可经 SSH 一键启动你自建的 Index-TTS 服务器，等待网关与模型健康检查就绪后提交任务；配音由服务端合成并回传成片，实时事件日志全程可见。"
    illo: "/media/illo/products/rtts-feature-remote.avif"
  - title: "逐句 Review 与交付校验"
    description: "自动识别单/多说话人（Speaker N 标签），语义分段 + 平衡时序默认值；成片下载后逐条校验配音音轨能量，缺音频的句子会拦下而不冒充完成。"
    illo: "/media/illo/products/rtts-feature-review.avif"
draft: false
---

给视频换一种语言的配音，麻烦的从来不是 TTS 本身，而是翻译、校对、对时和交付这些环节。Remote Index-TTS Dub 把这条链路做成一个刻意做小的原生 Mac 客户端：五步工作流——导入素材、生成译文（自配 OpenAI 兼容 API 或直接导入已翻译 SRT）、逐句 Review 锁定、启动远程服务、配音下载。

本地优先是它的底色：翻译和逐句校对留在本机，锁定译文之前一分钱远程费用都不产生；提交之后，App 会用 SSH 拉起你自建的 Index-TTS 服务并确认健康，下载的成片还要逐条校验每句译文窗口里的真实音频能量。声音克隆、情感迁移与时长控制属于远程服务的职责，客户端只把流程管好。
