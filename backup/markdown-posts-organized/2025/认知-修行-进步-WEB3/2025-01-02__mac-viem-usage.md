---
title: "mac上安装viem并编写代码"
date: "2025-01-02T07:18:30.000Z"
updated: "2025-01-02T07:26:16.670Z"
slug: "openspace/mac-viem-usage"
permalink: "/2025/01/02/openspace/mac-viem-usage/"
categories: ["认知-修行-进步-WEB3"]
tags: ["viem", "mac"]
---
mac上安装使用viem的过程 安装node，官网(https://nodejs.org/en)下载stable版本安装后node的位置在：①/usr/local/lib/node_modules/ 是默认的全局安装目录，但需要管理员权限②但我们可以设置用户定义的目录，用于不需要 sudo 的全局安装，通常有以下三个目录 123/User/whoami/.npm/ /User/whoami/.npm-global//User/whoami/.npmrc ③ 我们可以通过以下命令查看当前npm安装包存放的目录位置： 12npm prefix -gnpm config get prefix 通常我们建议设置用户自定义的目录，流程如下： 12mkdir ~/.npm-globalnpm config set prefix '~/.npm-global' 将路径添加到环境变量（如 ~/.zshrc 或 ~/.bashrc）： 1export PATH=$PATH:~/.npm-global/bin 备注：echo $SHELL ，如果你的shell使用的是zsh，那么/.zshrc是你使用的环境配置文件如果你的shell使用的是bash，那么/.bashrc是你使用的环境配置文件 解决权限问题： 12sudo chown -R $(whoami) ~/.npmsudo chown -R $(whoami) ~/.npm-global 并且确认你的npm prefix -g是你的用户自定义目录 npm安装package：两种安装方式，全局安装-g和局部安装–save-dev viem的使用，因为viem是使用typescript，所以你需要安装typescript ts-node 1npm install typescript ts-node viem @types/node --save-dev mac上编写viem例子的过程 mkdir 01_test && cd 01_test npm init -y 初始化package.json文件 npx tsc –init 初始化tsconfig.json文件 touch client.ts编写代码 npm install typescript ts-node viem dotenv types@node –save-dev 运行client.ts文件 ts-node client.ts package.json和tsconfig.json两个文件有什么区别？ mac上node的卸载和重新安装 检查node是否正常安装1234timchen@Tims-MacBook-Air-2 ~ % node -vv22.12.0timchen@Tims-MacBook-Air-2 ~ % npm -v10.9.0 参考链接： mac 下如何彻底解决node权限问题 https://kaifamiao.dev/?p=8765 node官网。https://nodejs.org/en node卸载和重装：https://cloud.baidu.com/article/3286031
