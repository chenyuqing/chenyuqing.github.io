---
title: "solidity高级主题"
date: "2024-02-28T07:01:30.000Z"
updated: "2025-01-02T07:34:37.802Z"
slug: "Web3/solidity/02-solidity高级主题"
permalink: "/2024/02/28/Web3/solidity/02-solidity高级主题/"
categories: ["技能-修行-进步-Web3"]
tags: ["solidity"]
---
高级主题目录继承 inheritance Solidity继承 关键字is，合约继承父合约 对于变量和函数，如果父合约中的权限是private则不能被子合约继承 对于变量，如果父合约中的权限是internal和public，则能被子合约继承，而如果是external时就不能继承 对于函数，如果父合约中的权限是internal和public, 则能被子合约继承，而如果是external时也能继承，但是在调用时使用的是：this.functionName() ChatGPT生成： Internal Protected： Solidity 0.8.0 版本引入了 internal protected 关键字修饰符，用于在派生合约中继承父合约的 internal 变量。这样的变量在父合约中是 internal 访问权限，但在派生合约中则是 protected 访问权限。 示例：internal protected uint256 myVariable; 抽象合约 abstract Solidity抽象合约 抽象合约是不能被实例化的合约，只能被继承 抽象合约中的函数不能有实现 抽象合约中的函数不能是private 抽象合约中的函数不能是external 抽象合约中的函数不能是pure 抽象合约中的函数不能是view 抽象合约中的函数不能是payable 抽象合约中的函数不能是internal 抽象合约中的函数不能是public 抽象合约中的函数不能是final 抽象合约中的函数不能是override 抽象合约中的函数不能是virtual 抽象合约中的函数不能是external 抽象合约中的函数不能是constant 抽象合约中的函数不能是immutable 抽象合约中的函数不能是stateMutability 抽象合约中的函数不能是returns 接口 interface Solidity接口 无法实现任何功能 可以继承其他接口 所有声明的函数必须是外部的 无法声明构造函数, 无法声明状态变量 库函数 library Solidity库函数，一种函数集合-library 库与合约类似，但你不能声明任何状态变量，也不能发送以太币。 库的目的是重用代码，库的函数可以被其他合约调用。 如果所有库函数都是内部的，则库将嵌入到合约中。否则，必须在部署合约之前部署并链接库。 多态 polymorphism Solidity多态 异常处理 exception Solidity异常处理 安全性 security Solidity安全性 日志 log event(), emit()
