---
title: "fundme dapp开发"
date: "2024-03-06T02:02:30.000Z"
updated: "2024-03-06T02:16:08.546Z"
slug: "Web3/solidity/03-fundme_dapp"
permalink: "/2024/03/06/Web3/solidity/03-fundme_dapp/"
categories: ["技能-修行-进步-Web3"]
tags: ["solidity"]
---
项目背景 在学习完solidity的基础知识后的第一个实践项目。 捐款项目主要功能 任何人可以进行捐款，捐款有最低额度限制 只有合约部署者能进行提款 使用的是ETH/USD，需要导入chainlink预言机查找eth实时价格 本项目中涉及的solidity知识： 库（library）的使用 接口（interface）的使用 关键字payable的使用, transfer, send, call三种方法的区别，receive() external payable{} 和 fallback() external payable{} 关键字internal和external的用法 address(this).balance，msg.sender msg.value 如何优化gas，例如使用constant，immutable等关键字定义相关变量，custom error emit日志使用方法 chainlink预言机的调用 项目UML图 chainlink预言机的调用 chainlink学习
