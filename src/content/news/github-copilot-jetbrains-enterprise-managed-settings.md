---
title: "GitHub Copilot for JetBrains 新增企业托管设置"
link: "https://github.blog/changelog/2026-08-18-enterprise-managed-settings-in-github-copilot-for-jetbrains"
category: "工具与应用"
description: "GitHub Copilot for JetBrains 新增企业托管设置，让管理员统一管控插件、MCP 连接、遥测和智能体权限。"
pubDate: 2026-08-18
tags: ["AI编程","AI安全","产业落地"]
draft: true
---

GitHub 宣布，GitHub Copilot for JetBrains 现已支持由企业统一管理的设置，覆盖插件治理、MCP 服务器访问、OpenTelemetry 配置和智能体权限模式。相关控制适用于企业 Copilot 计划中的用户。

在插件治理方面，管理员可通过 `enabledPlugins` 要求启用或禁用指定插件，通过 `extraKnownMarketplaces` 提供获批插件源，并通过 `strictKnownMarketplaces` 将安装范围限制在批准的市场来源。

对于 MCP，管理员可使用 `allowedMcpServers` 和 `deniedMcpServers`，集中控制开发者能够从 GitHub Copilot for JetBrains 连接的服务器，阻止连接企业允许名单之外的服务器。

企业也可统一配置 Copilot 的 OpenTelemetry，包括采集器端点、协议、服务名称、资源属性和内容捕获策略。托管值优先于开发者设置；开发者仍可在 JetBrains 的 GitHub Copilot Chat 设置中查看实际应用的配置。

权限方面，管理员可将 `permissions.disableBypassPermissionsMode` 设为 `disable`，阻止 JetBrains 中的 Copilot 智能体使用 Bypass Approvals 或 Autopilot。官方建议安装最新版 GitHub Copilot for JetBrains 插件体验这些能力。

这些变化的实际意义是，使用 JetBrains IDE 的企业团队可以把 Copilot 的扩展来源、外部 MCP 连接、遥测去向和高权限智能体模式纳入统一治理，减少个人配置差异。需要注意的是，官方公告仅说明企业 Copilot 计划及最新版插件场景，未提供具体插件版本号，也未说明其他 IDE 是否同步支持这些托管设置。

## 来源

- https://github.blog/changelog/2026-08-18-enterprise-managed-settings-in-github-copilot-for-jetbrains
