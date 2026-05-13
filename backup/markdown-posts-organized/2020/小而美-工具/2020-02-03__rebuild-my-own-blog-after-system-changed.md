---
title: "rebuild my own blog after system changed - Ubuntu"
date: "2020-02-03T06:09:27.000Z"
updated: "2024-03-16T15:23:24.359Z"
slug: "小而美-工具/rebuild-my-own-blog-after-system-changed"
permalink: "/2020/02/03/小而美-工具/rebuild-my-own-blog-after-system-changed/"
categories: ["小而美-工具"]
tags: ["hexo", "blog", "rebuild", "myself"]
---
System info Ubuntu 16.04 Git Node Todosinstall nodeks and npm1234567891011121314# 更新sudo apt-get update# 安装低版本的node，然后再升级最新sudo apt-get install nodejssudo apt install nodejs-legacysudo apt install npm#安装更新版本的工具N，执行：sudo npm install n -g#跟新node版本，执行：sudo n stablesudo node -v# install hexo-clisudo npm install -g hexo-cli install and config git ref1, how to use git quickly Part 1 ref2, how to use git quickly part 2 install hexo with npm12345678910111213141516171819-(1) delete origiginal your own github.io repository-(2) create the new one-(3) git clone to local-(4) hexo init <folder>, and move the contents into local github.io repository-(5) move your own theme files and confg.yaml file to the proper location-(6) install the node libs what your theme needs to satisfy- for example, I use the indigo theme, I should run below commandscd <github.io folder># 主题默认使用 less 作为 css 预处理工具。npm install hexo-renderer-less --save# 用于生成 rss。npm install hexo-generator-feed --save# 用于生成静态站点数据，用作站内搜索的数据源。npm install hexo-generator-json-content --save# 用于生成微信分享二维码。npm install hexo-helper-qrcode --save# error, hexo d后 ERROR Deployer not found: gitnpm install --save hexo-deployer-git write posts and deploy123456hexo cleanhexo ghexo shexo d# only fit for me to update my own blog. reference http://www.longmuchen.cn/2019/04/18/tools/2019-04-18-zai-ubuntu-14.04-fu-wu-qi-shang-bu-shu-hexo-bo-ke/
