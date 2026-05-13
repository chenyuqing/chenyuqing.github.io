可以把 `design.md` 写成一份**视觉规范 + 组件规范 + 页面规范**，方便后续丢给 Codex / Cursor / 前端工程师直接实现。

下面是一版适合你这种 **“清爽可爱现代 2D 扁平卡通风”个人网站** 的完整 `design.md`：

````md
# Personal Website Design System

## 1. 设计定位

本网站采用「清爽可爱的现代 2D 扁平卡通风」作为核心视觉风格。

整体感觉应该是：

- 亲切
- 干净
- 可爱但不幼稚
- 有创作者气质
- 像一个有温度的个人品牌主页
- 适合展示个人介绍、作品集、项目、文章、联系方式

视觉语言参考：

- 粗黑描边
- 扁平色块
- 圆润造型
- 明亮但克制的配色
- 简单阴影
- 卡通头像 / 吉祥物 / 插画场景
- 眼睛带高光，表情友好

关键词：

> clean, cute, flat 2D, bold outline, friendly, creator, playful, modern, portfolio

---

## 2. 整体视觉风格

### 2.1 风格描述

网站整体应像一套精致的 2D 插画系统，而不是传统严肃的个人简历网站。

画面中可以出现：

- 卡通化个人头像
- 小象 / 小动物吉祥物
- 创作工作室插画
- 电脑、相机、麦克风、AI 图标等创作者道具
- 简洁的圆角卡片
- 轻微浮动动画
- 手绘感但边缘干净的图形元素

风格要求：

- 不要写实 3D
- 不要赛博朋克
- 不要过度渐变
- 不要复杂纹理
- 不要玻璃拟态过重
- 不要极简黑白冷淡风

目标效果：

> 像一个可爱、专业、可信赖的 AI 创作者 / 开发者 / 产品人的个人主页。

---

## 3. 色彩系统

### 3.1 主色

主色建议使用暖橙色，体现亲和力和创作者能量。

```css
--color-primary: #FF8A00;
--color-primary-light: #FFB84D;
--color-primary-dark: #E66F00;
````

### 3.2 辅助色

用于插画、标签、按钮 hover、图标背景。

```css
--color-blue: #2EC4FF;
--color-red: #FF4B2B;
--color-yellow: #FFD84D;
--color-green: #A8E000;
--color-purple: #8B5CF6;
```

### 3.3 中性色

用于背景、文字、卡片、边框。

```css
--color-bg: #FFF8EE;
--color-bg-soft: #FFFDF8;
--color-card: #FFFFFF;
--color-text: #1F1F1F;
--color-text-muted: #666666;
--color-border: #111111;
--color-line-soft: #E8DCCB;
```

### 3.4 使用原则

* 页面背景以暖白 / 奶油色为主。
* 黑色描边是风格核心，不要改成浅灰描边。
* 主按钮使用橙色。
* 插画颜色可以更活泼，但页面 UI 颜色要克制。
* 每屏最多使用 2 到 3 个高饱和色，避免杂乱。

---

## 4. 线条与描边

### 4.1 描边规则

所有核心视觉元素应有明显黑色描边。

适用对象：

* 卡通头像
* 吉祥物
* 图标
* 插画卡片
* 按钮
* 标签
* 作品卡片
* 输入框
* 导航栏重点元素

推荐描边：

```css
border: 2px solid #111111;
```

大型插画可以使用：

```css
border-width: 3px;
```

### 4.2 描边风格

* 线条要圆润。
* 不要使用锐利、科技感过强的线条。
* 图标和插画线条要统一。
* 边框可以略微不对称，但整体仍需干净。

---

## 5. 圆角系统

整体使用较大圆角，形成可爱、柔和的视觉感。

```css
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;
--radius-full: 999px;
```

使用建议：

* 按钮：14px - 999px
* 卡片：20px - 28px
* 图片容器：20px
* 标签：999px
* 弹窗：28px

---

## 6. 阴影系统

阴影要像卡通贴纸一样，不要过度真实。

### 6.1 卡通硬阴影

核心风格建议使用黑色偏移阴影：

```css
box-shadow: 6px 6px 0 #111111;
```

适用于：

* Hero 主卡片
* CTA 按钮
* 项目卡片
* 重点模块

### 6.2 柔和阴影

用于次级卡片：

```css
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
```

使用原则：

* 主要视觉元素使用硬阴影。
* 次要内容使用柔和阴影。
* 不要同时堆太多阴影。

---

## 7. 字体系统

### 7.1 中文字体

优先使用系统字体，保持清晰易读。

```css
font-family:
  "PingFang SC",
  "Microsoft YaHei",
  "Noto Sans SC",
  sans-serif;
```

### 7.2 英文字体

建议使用圆润现代的无衬线字体。

```css
font-family:
  "Inter",
  "Nunito",
  "Arial",
  sans-serif;
```

### 7.3 字体风格

标题应清晰、有力量，但不要太严肃。

推荐：

* 大标题：粗体，圆润
* 正文：中等字重
* 标签：半粗体
* 按钮：粗体

字号建议：

```css
--font-hero: 56px;
--font-h1: 44px;
--font-h2: 32px;
--font-h3: 24px;
--font-body: 16px;
--font-small: 14px;
```

移动端：

```css
--font-hero-mobile: 36px;
--font-h1-mobile: 32px;
--font-h2-mobile: 26px;
--font-body-mobile: 15px;
```

---

## 8. 插画风格规范

### 8.1 人物头像

个人头像应使用 2D 扁平卡通风。

要求：

* 正面或 3/4 视角
* 粗黑描边
* 简化五官
* 眼睛带小白色高光
* 微笑或露齿笑
* 发型保留真实识别度
* 衣服颜色尽量接近真实穿搭
* 背景简洁

禁止：

* 写实肖像
* 复杂阴影
* 过度二次元
* 夸张大眼萌系
* 厚涂风
* 3D 皮克斯风

### 8.2 吉祥物

可以使用小象作为个人网站的辅助角色。

小象风格：

* 灰色毛绒身体
* 大耳朵
* 蓝色眼睛
* 眼睛有高光
* 红白帽子
* 红色披风
* 圆润身体
* 表情友好

使用场景：

* 首页 Hero
* 空状态页面
* 404 页面
* 加载动画
* 联系我模块
* 项目说明中的小图标

### 8.3 场景插画

场景可以包括：

* 创作者工作室
* 城市街道
* 电脑桌
* AI 工具面板
* 摄影 / 视频设备
* 项目展示墙

场景要求：

* 保留空间透视，但简化细节
* 建筑和道具都使用黑色描边
* 色彩偏暖
* 元素不要过密
* 主体必须一眼可见

---

## 9. 图标风格

图标应使用统一的卡通线性图标。

规范：

* 黑色粗描边
* 圆角端点
* 简单几何形
* 可搭配少量填色
* 图标背景可使用浅色圆角方块

示例：

```css
.icon-card {
  border: 2px solid #111;
  border-radius: 16px;
  background: #fff;
  box-shadow: 4px 4px 0 #111;
}
```

图标类型：

* AI
* 视频
* 字幕
* 翻译
* 配音
* 代码
* 作品集
* 邮件
* GitHub
* YouTube

---

## 10. 页面结构

网站建议包含以下页面：

```txt
/
首页

/about
关于我

/projects
项目 / 作品集

/blog
文章 / 思考

/tools
工具 / 产品

/contact
联系我
```

也可以做成单页滚动结构：

```txt
Hero
About
Skills
Projects
Process
Blog
Contact
Footer
```

---

## 11. 首页设计

### 11.1 Hero 区域

Hero 是网站最重要的一屏。

布局建议：

左侧：

* 大标题
* 简短介绍
* CTA 按钮
* 社交链接

右侧：

* 个人 2D 卡通头像
* 或小象吉祥物
* 或创作者工作室插画

示例文案：

```txt
Hi, I'm Chen.
I build AI-powered creative tools.
```

中文版本：

```txt
你好，我是陈拍摄
我在做 AI 创作工具、视频工作流和字幕产品。
```

CTA：

```txt
查看作品
联系我
```

视觉要求：

* 标题大而清晰
* 右侧插画要有强记忆点
* 背景可加入浅色圆点、星星、贴纸元素
* CTA 按钮使用卡通硬阴影

---

## 12. 关于我模块

展示个人介绍，不要像传统简历太严肃。

内容可以包括：

* 我是谁
* 我关注什么
* 我正在做什么
* 我擅长什么
* 我的创作方向

卡片形式：

```txt
AI Tools
Video Workflow
Subtitle System
Creator Product
Design Experiments
```

每个卡片配一个小图标。

---

## 13. 项目展示模块

项目卡片采用 2D 卡片式设计。

### 13.1 项目卡片结构

每张卡片包含：

* 项目封面图
* 项目名称
* 一句话介绍
* 标签
* 查看详情按钮

示例：

```txt
Subtitle Maker
AI subtitle recognition, translation, voice cloning and dubbing tool.
```

标签：

```txt
AI
字幕
翻译
配音
Web App
```

### 13.2 卡片样式

```css
.project-card {
  background: #fff;
  border: 2px solid #111;
  border-radius: 24px;
  box-shadow: 6px 6px 0 #111;
  padding: 24px;
}
```

hover：

```css
.project-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 #111;
}
```

---

## 14. 博客 / 文章模块

文章列表不需要太复杂。

卡片内容：

* 标题
* 摘要
* 日期
* 分类标签
* 阅读按钮

风格：

* 白色卡片
* 黑色描边
* 彩色标签
* 轻微 hover 动效

分类示例：

```txt
AI Agent
Creator Economy
Subtitle Tech
Design
Deployment
```

---

## 15. 联系模块

联系模块可以设计得更有趣。

建议画面：

* 小象拿着信封
* 或卡通头像坐在电脑前
* 或一个大大的邮件卡片

内容：

```txt
Want to build something together?
Let's talk.
```

中文：

```txt
想一起做点有意思的东西？
欢迎联系我。
```

按钮：

```txt
Email Me
GitHub
YouTube
X / Twitter
```

---

## 16. 按钮规范

### 16.1 主按钮

```css
.button-primary {
  background: #FF8A00;
  color: #111;
  border: 2px solid #111;
  border-radius: 999px;
  box-shadow: 4px 4px 0 #111;
  font-weight: 700;
  padding: 12px 22px;
}
```

hover：

```css
.button-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #111;
}
```

### 16.2 次按钮

```css
.button-secondary {
  background: #fff;
  color: #111;
  border: 2px solid #111;
  border-radius: 999px;
  box-shadow: 4px 4px 0 #111;
}
```

---

## 17. 卡片规范

卡片是网站的主要信息容器。

```css
.card {
  background: #FFFFFF;
  border: 2px solid #111111;
  border-radius: 24px;
  box-shadow: 6px 6px 0 #111111;
  padding: 24px;
}
```

卡片可以使用轻微彩色背景：

```css
.card-yellow {
  background: #FFF2B8;
}

.card-blue {
  background: #DDF5FF;
}

.card-orange {
  background: #FFE0B5;
}
```

---

## 18. 标签规范

标签用于项目分类、文章分类、技能标签。

```css
.tag {
  display: inline-flex;
  align-items: center;
  border: 2px solid #111;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  background: #FFF;
}
```

颜色示例：

```css
.tag-ai {
  background: #DDF5FF;
}

.tag-design {
  background: #FFE0B5;
}

.tag-video {
  background: #FFD6E8;
}

.tag-code {
  background: #DFFFD6;
}
```

---

## 19. 动效规范

动效要轻快、可爱，不要复杂。

推荐动效：

* 卡片 hover 轻微上浮
* 按钮按下时缩小 0.98
* 吉祥物轻微上下浮动
* 图标进入时轻微弹性缩放
* 页面滚动时淡入

示例：

```css
@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}
```

吉祥物：

```css
.mascot {
  animation: float 3s ease-in-out infinite;
}
```

---

## 20. 响应式规范

### 桌面端

* 最大内容宽度：1120px - 1200px
* Hero 使用左右双栏
* 项目卡片使用 2 到 3 列
* 插画可以较大

### 平板端

* Hero 可保持双栏或改为上下布局
* 项目卡片 2 列

### 移动端

* Hero 改为上下布局
* 插画放在标题下方
* 卡片单列
* 按钮全宽或半宽
* 字号降低
* 避免过多装饰元素

---

## 21. 图片与插画生成规范

生成网站插画时统一使用以下提示词方向：

```txt
clean modern 2D flat vector cartoon illustration,
bold black outlines,
rounded cute shapes,
friendly expression,
simple geometric forms,
bright but soft color palette,
minimal shading,
small white highlights in the eyes,
polished creator-brand style,
warm off-white background,
no realistic 3D,
no heavy texture,
no complex shadows
```

中文描述：

```txt
清爽现代 2D 扁平矢量卡通风，粗黑描边，圆润可爱造型，友好表情，简单几何形，明亮但柔和的配色，少量阴影，眼睛带小白色高光，适合个人品牌和创作者网站，不要写实 3D，不要复杂纹理。
```

---

## 22. 网站气质

网站不应该只是一个作品展示页，而应该像一个有角色感的个人品牌。

用户进入网站后应该感受到：

* 这个人很有创造力
* 懂 AI 和产品
* 视觉审美统一
* 亲和、可信赖
* 不是模板站
* 有自己的角色 IP 和表达方式

---

## 23. 禁止事项

不要使用：

* 冷冰冰的纯黑白科技风
* 过度玻璃拟态
* 复杂赛博朋克背景
* 过多霓虹光效
* 写实 3D 人物
* 过度拟物按钮
* 大量细碎纹理
* 低质量 clipart
* 字体过多
* 配色超过 5 个主视觉色
* 无描边的扁平图标

---

## 24. 参考页面氛围

目标不是传统简历站：

```txt
姓名
经历
技能
联系方式
```

而是更像：

```txt
一个 AI 创作者的个人品牌主页
一个带有可爱角色 IP 的作品集
一个展示项目、想法和工具的创意工作室入口
```

---

## 25. 一句话设计原则

> 用粗黑线、圆润造型、明亮暖色、简单阴影和有高光的眼睛，打造一个亲切、清爽、可爱但仍然专业的个人网站。

````

这份 `design.md` 可以直接作为前端实现规范。  
你后续给 Codex / Cursor 的时候，可以再加一句：

```txt
请严格按照 design.md 实现页面，不要使用写实、玻璃拟态、赛博朋克或复杂渐变风格。所有核心卡片、按钮和插画元素都要保持粗黑描边、圆角、扁平色块和轻微卡通硬阴影。
````
