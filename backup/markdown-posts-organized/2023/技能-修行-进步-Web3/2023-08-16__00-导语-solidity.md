---
title: "solidity导语"
date: "2023-08-16T02:32:30.000Z"
updated: "2025-01-02T07:34:30.974Z"
slug: "Web3/solidity/00-导语-solidity"
permalink: "/2023/08/16/Web3/solidity/00-导语-solidity/"
categories: ["技能-修行-进步-Web3"]
tags: ["solidity"]
---
Github库地址： solidity-by-example solidity是一门编译性语言，需要经过编译器编译成字节码，然后再部署到区块链上，所以需要安装编译器，推荐使用remix在线编译器，也可以使用truffle本地编译器，但是truffle需要安装nodejs，npm，ganache等环境，比较麻烦，所以推荐使用remix。 solidity是一门面向合约的语言，所以需要有合约的概念，合约是一种特殊的类，合约中可以定义状态变量，函数，事件，修饰器，结构体，枚举等。 Remix-IDE remix 面板介绍 Hello World123456// SPDX-License-Identifier: MITpragma solidity ^0.8.18;contract helloWorld&#123; string public _str = "hello world";&#125; 代码解释 // SPDX-License-Identifier: MIT：开源协议 pragma solidity ^0.8.18;：版本声明 contract helloWorld：合约声明 string public _str = "hello world";：状态变量声明 Solidity基础知识 solidity基础知识 Solidity高级主题 solidity高级主题 参考资料 以太坊白皮书 极力推荐入门教程，配合食用更佳！写智能合约，节省gas费用永远放在第一位。 solidity中文网 僵尸打怪-Solidity: Beginner to Intermediate Smart Contracts WTF-Solidity 101 入门 Solidity8.0全面精通-B站崔棉大师 理想区块链 Fred带你学solidity
