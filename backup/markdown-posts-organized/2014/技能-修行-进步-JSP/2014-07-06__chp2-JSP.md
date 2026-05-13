---
title: "chp2_JSP"
date: "2014-07-06T14:19:41.000Z"
updated: "2023-07-22T01:32:20.266Z"
slug: "技能-修行-进步-JSP/chp2-JSP"
permalink: "/2014/07/06/技能-修行-进步-JSP/chp2-JSP/"
categories: ["技能-修行-进步-JSP"]
tags: ["JSP网页开发"]
---
第二章 2.3 安装和配置Tomcat(page15) Tomcat 服务器的默认端口是 8080 访问Tomcat的默认路径是：http://localhost:8080 2.3.1 配置Tomcat(page18) 更改服务端口：在Tomcat下打开conf文件夹找到server.xml文件用记事本打开在**< connector port =”8080” >**中把8080更改即可 2.3.2 测试第一个JSP页面(page20) 第一段JSP程序（Hello World） <%****out.print(“Hello World”);****%> 对这个程序做简单的说明： 所有的JSP脚本程序都必须用“<%”和“%>”括起来； 可以用out对象的print方法输出信息，输出的字符需要用双引号括起来； 每一条JSP语句的末尾用分号结束。
