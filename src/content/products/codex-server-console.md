---
name: "Codex Server Console"
title: "Codex Server Console"
tagline: "对话式远程服务器操作台：Codex CLI 编排，受控执行，全程可验证"
description: "原生 macOS 远程服务器操作台：在对话中调用你已安装的 Codex CLI，让它在受控 server-ops 权限下检查、操作和验证远程生产服务器。命令、日志、状态与产物在同一界面可见，高风险操作需要明确批准，完成后提醒释放按小时计费的服务器资源。"
status: "beta"
type: "infra"
featured: false
pinned: false
order: 4
download: "https://github.com/chenyuqing/chenyuqing.github.io/releases/download/codex-server-console-v0.9.0/Codex-Server-Console-v0.9.0-arm64.dmg"
downloadVersion: "0.9.0"
downloadSize: "约 2 MB"
illo: "/media/illo/products/codex-server-console.avif"
icon: "/media/products/codex-server-console/app-icon.avif"
platform: "macOS 14+ · Apple Silicon"
audience: "维护远程生产服务器、想让 Codex CLI 在受控权限下代执行运维的开发者"
pubDate: 2026-08-29
updatedDate: 2026-08-29
tags: ["Server Ops", "Codex CLI", "SSH", "Developer Tool"]
stack: ["SwiftUI", "Codex CLI", "OpenSSH", "Swift Package Manager"]
highlights:
  - title: "对话负责理解"
    description: "在对话框里描述目标，由你已安装的 Codex CLI 参与理解和编排。它不重建 Agent，也不做通用 SSH 客户端——只做把对话变成受控操作的操作台。"
  - title: "受控 server-ops 执行"
    description: "通过受控的 server-ops 能力执行远程检查或操作：真实命令、日志、状态和产物在同一界面可见，复用本机 OpenSSH 配置与 Keychain / SSH agent，风险操作需要明确批准。"
  - title: "完成即验证"
    description: "执行完成后验证远程结果，并提醒释放按小时计费的服务器资源——付费服务器空转和忘记关机，是产品化解决的真实运维风险。"
draft: false
---

运维远程生产服务器时，真正的成本不在敲命令，而在「描述目标 → 理解现状 → 选择命令 → 确认风险 → 验证结果」这条链路上反复切换工具。Codex Server Console 把这条链路收进一个原生 Mac 操作台：选一个远程服务器，在对话框里描述目标，由已安装的 Codex CLI 参与理解和编排，通过受控的 server-ops 能力执行，命令、日志、状态和产物全程可见。

它的分工原则很清楚：**对话负责理解，工具负责执行，远程输出负责证明，用户负责高风险批准。** 服务器设置支持直接粘贴 `ssh -p <port> user@host` 快速解析，SSH 凭据复用本机 OpenSSH 配置与 Keychain，不写入应用之外；有风险的操作必须明确确认，完成后会提醒你释放计费资源。
