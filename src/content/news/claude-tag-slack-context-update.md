---
title: "Claude Tag 扩大 Slack 上下文，主动响应判断提升约 30%"
link: "https://claude.com/blog/claude-tag-now-reads-even-more-of-the-room"
category: "工具与应用"
description: "Anthropic 让 Claude Tag 结合 Slack 频道上下文、记忆与常驻指令判断是否主动响应，官方称判断能力提升约 30%，同时保留频道开关与权限边界。"
pubDate: 2026-08-13
tags: ["产业落地","大模型"]
draft: false
---

Anthropic 于 8 月 13 日宣布，Claude Tag 在 Slack 中判断是否主动参与讨论时，不再只看单条新消息，而会结合频道内的上下文、Claude 的记忆以及用户预先设置的常驻指令。官方称，这使其判断“何时应该回应、何时不应回应”的能力提升约 30%。

此前，Claude Tag 依靠一个轻量分类器逐条判断消息，只能作出是否介入的二选一决定。移除该分类器后，Claude 可根据跨消息语境选择四种动作：直接简短回复、在线程中启动深入工作、把新消息归入正在进行的工作流，或保持沉默。

读取范围扩大并不意味着 Claude 会无条件发言。Anthropic 表示，Claude 会依据回复是否有用、置信度以及是否有更合适的人选等原则评估是否参与；如果连续判断没有内容可补充，它会降低对该频道的关注，而被 @ 提及后会立即恢复响应。

用户仍可通过自然语言设定行为边界，例如要求 Claude 仅在被提及时回复，或允许它主动参与特定主题。任何频道成员也可以关闭“Respond automatically”。Claude 的实际行动仍受已配置的权限、工具和任务范围约束。

官方还称，新增上下文不计入任何套餐的用量或支出上限，目前不额外收费。更新同时缩短了首次反馈等待：Claude 会在数秒内确认收到请求，但任务本身所需时间不变。

这项更新的实际意义在于，Claude Tag 从按单条消息触发的被动响应工具，更接近能够理解团队连续讨论并衔接工作流的协作者。不过，其主动性并非无限扩大，而是由频道开关、自然语言指令以及既有权限共同约束。该更新已面向 Claude Teams 和 Enterprise 客户提供。

## 来源

- https://claude.com/blog/claude-tag-now-reads-even-more-of-the-room
