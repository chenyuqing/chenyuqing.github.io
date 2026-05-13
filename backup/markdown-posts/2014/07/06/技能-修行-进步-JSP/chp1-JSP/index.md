---
title: "chp1_JSP"
date: "2014-07-06T14:13:19.000Z"
updated: "2023-07-22T01:32:14.953Z"
slug: "技能-修行-进步-JSP/chp1-JSP"
permalink: "/2014/07/06/技能-修行-进步-JSP/chp1-JSP/"
categories: ["技能-修行-进步-JSP"]
tags: ["JSP网页开发"]
---
第一章 1.3.3 JSP 概述(page5) jsp的最大优点是：开放的，跨平台的结构，它可以运行在所有的服务器系统上。 JSP与ASP的区别： 每次访问asp文件，服务器都要将该文件解释一遍，然后将标准的HTML代码发送到客户端； 而JSP有所不同，当第一次访问JSP文件时，服务器先将JSP编译成二进制码，以后再访问的时候，就直接访问二进制码，这样大大提高了执行的效率。 总结：JSP一次编译，多次运行；而ASP每次运行需要每次编译。 JSP的优点如下： 多平台的支持，可以再所有的服务器操作系统上运行。 编译后执行，能够大大提高执行效率。 JSP采用Java技术，Java应用比较普遍，因此学习起来比较容易。 JSP是J2EE十三种核心技术中的一种，可以和其他核心技术共同建立企业应用。 JSP的缺点如下： 开发环境相对ASP来说，比较复杂。需要先安装JDK，然后安装Web服务器。 相对ASP的VBsript脚本语言，Java语言学起来稍微复杂。 1.4.3 J2EE体系概述(page6) J2EE的任务是提供一个平台独立的，便携式，多用户，安全及标准的企业级平台。 J2EE的13种核心技术包括（不全，常见的）： JDBC (Java Database Connectivity, Java数据库连接) EJB （Enterprise Java Bean，企业JavaBean） JSP （Java Server Pages, Java服务器端网页） Servlet （服务器端小程序） XML （eXtensible Markup Language） JavaMail (Java邮件) JTS （Java Transaction Service, Java事务服务） 。。。 1.5.1 N层开发框架（page8） 理想的J2EE体系包括6个层：表示，应用，服务，域，连通性和持续化。 这些层横跨客户机和服务器，而它们逻辑上划分为Web容器，EJB容器和数据库，如图1-7所示：![](/img/jsp_review/1-7.jpg)
