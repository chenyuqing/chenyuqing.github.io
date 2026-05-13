---
title: "chp8_JSP"
date: "2014-07-06T14:27:37.000Z"
updated: "2023-07-22T01:33:02.646Z"
slug: "技能-修行-进步-JSP/chp8-JSP"
permalink: "/2014/07/06/技能-修行-进步-JSP/chp8-JSP/"
categories: ["技能-修行-进步-JSP"]
tags: ["JSP网页开发"]
---
第八章 Hibernate数据持久化技术 8.1.1 ORM的基本概念(page211) ORM （Object/Relation Mapping）对象关系映射 作用 实现了Java应用中的对象到关系数据库中的表的自动的（和透明的）持久化，使用元数据描述对象鱼数据库间的映射。 ORM的优点 可以提高生产率，增加程序的可维护性，提供更好的性能。 8.1.2 POJO与PO的概念(page211) POJO (Pure Old Java Object或者Plain Ordinary Java Object，纯Java对象)，用来与数据库表建立映射的Java文件。 PO （Persistent Object，持久化对象），是在操作数据库时创建的对象。 有一下的数据库表 CREATE TABLE User ( id int, name varchar(20) ) 编写一个与之对应的持久化对象的类 public class User &#123; private long id; private String name; public void setId(long id)&#123; this.id = id; &#125; public void setName(String name) &#123; this.name = name; &#125; public long getId() &#123; return id; &#125; public String getName() &#123; return name; &#125; &#125; 加强训练 给出以下数据库表（page217） use pubs; go CREATE TABLE Usertab ( userid int Identity primary key, username varchar(20), userpwd varchar(20) ) INSERT INTO usertab values('tom','tom'); 编写一个与之对应的持久化对象的类(page223) import java.io.Serializable; public class Usertab implements Serializable &#123; private Integer userid; private String username; private String userpwd; public Usertab()&#123;&#125; public Usertab(String username, String userpwd) &#123; this.username = username; this.userpwd = userpwd; &#125; public Integer getUserid() &#123; return userid; &#125; public void setUserid(Integer userid) &#123; this.userid = userid; &#125; public String getUsername() &#123; return username; &#125; public void setUsername(String username) &#123; this.username = username; &#125; public String getUserpwd() &#123; return userpwd; &#125; public void setUserpwd(String userpwd) &#123; this.userpwd = userpwd; &#125; &#125;
