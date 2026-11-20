---
title: 我的建站史
published: 2026-11-20
publishedAt: 2026-11-20T22:55:00+08:00
description: 从 WordPress 到 Shirone，从头讲讲我的建站探索历程
tags: [Blog]
category: 技术
draft: false
series: blog-construction
---

多年以来，我一直想拥有一个真正属于我自己的网站。

## 零周目
2022 年前后，我找到了 WordPress，一个很受欢迎的内容部署服务，尤其适合博客。

其部署方式分为两种，一个是[ wordpress.com ](https://wordpress.com/)上的全流程免费 0 代码的“傻瓜式”**托管**方案，和稍微费些神的[ wordpress.org ](https://wordpress.org/)开源软件**自部署**方案。

当时的我为了追求方便直接选择了最简单快速的托管方案。很快注册并搭建好了我的第一个博客网站。

免代码和托管的方式虽然带来了极致的便利，可以“拎包入住”，但是天下没有免费的午餐，有得必有失。免费版 WordPress 网站的功能被严重限制：

- 只能只用官方提供的免费三级域名

  不过 WordPress 提供的免费三级域还算比较好看，比如 .code.blog ，这比那些 .dpdns.org / .us.kg 看上去好多了（

- 广告

  - 页脚上无法去除的“基于 WordPress 构建”的提示
  - 推广 WordPress 的广告弹窗

- 主题有限
- 插件有限
- （中国大陆的）访问体验很慢

当时的我是肯定没有这个实力和闲钱去买 WordPress 的订阅或自部署的，因此搭建出来的网站非常原始和粗糙。闲置一段时间之后，我关掉了它。

## 半周目

在关掉 WordPress 上的网站之后，我又了解到了 Halo，一个很受欢迎的国产开源建站工具。其后端基于 Java，首选部署平台是 Docker。正好我手上就有一台装好了 Docker 的 NAS，我就直接在上面安装尝试了一下。

简单体验了一下，优点非常多：部署便捷，主题多样，插件丰富，后台完善……每一个都很吸引人。

可惜的是 Halo 由于基于 Java 使其内存占用偏高，意味着我必须花更多钱购买相对高配置的服务器，这是我所不能接受的。

虽然可以在我自己的 NAS 部署，然后使用 Cloudflare Tunnel 暴露到公网，不过出于可用性和安全性考虑，最终还是放弃了。

## ScophireSpace（一周目）

转眼到了 2025 年 10 月，我终于有能力去重拾建博客的计划。先是在阿里云上注册了这个域名 `scophire.space`，得到了一个简洁体面的入口。在此之后，我就一直在寻找建立一个全新博客的方案。

2026 年初，我在 Solar Network 偶然翻到了[ NecoArc-Chaos 的博客 ](https://nachaos.xyz/)，顺着其中的链接，找到了[ Mizuki ](https://github.com/LyraVoid/Mizuki/)这个博客主题。

> Mizuki 是一个基于 Astro 和 Tailwind CSS 构建的静态博客/个人主页模板，主打 Material Design 3 视觉风格。

这样一个博客主题很快吸引了我。其优点是实打实的：

- Material Design 设计，现代优雅
- 成本极低，部署在 Cloudflare Pages 上，免费版就能直接白嫖 Cloudflare 全球的边缘节点（不愧是赛博活佛），我需要支付的费用也只有域名
- 工作流很顺畅，本地 `pnpm dev`一条命令构建预览，改完之后直接使用 git 推送到远程仓库，Cloudflare Pages 支持链接 GitHub 仓库自动部署，实在太方便了

在 ChatGPT 的帮助下，我初步敲定了一个计划：

1. 注册 Cloudflare 账户并绑定我的域名
2. Fork 并 clone 源仓库到本地
3. 安装依赖，搭建构建环境
4. 初步编辑
5. 推送，起飞~

2026 年 3 月 8 日，一个阴天的下午，ScophireSpace 的一周目在构建环境中诞生了。经过一段时间的配置，我成功上线了它。

不过很快，我就发现当时的 ScophireSpace 存在两大硬伤：

- 我个人的技术不足

  当时的我连 git 都用得磕磕绊绊，vibe coding 也不会，一切都是纯手工的胡来。

- Mizuki 自身的缺点  
  
  Mizuki 自身的架构中配置文件松散，冗余内容过多（甚至还有看板娘和樱花飘落效果），媒体资源放置位置很诡异

受限于这两大点，ScophireSpace 本身不算很成功。

不过至少在社区上，ScophireSpace 确实有一些成果。

2026 年 5 月 24 日，Solsynth 上线了其官方友联收录与认证平台[ “中羊网备” ](https://solsynth.dev/zh/products/roy-filling)（[源帖](https://web.solian.app/#/posts/019e5a1a-6780-7e39-8b10-04a581826081)）

作为 Solar Network 社区的一份子，当天下午我就递交了邮件申请，很快就获得了 `羝 ICP 备 202600002 号` 的备案号，成为了第一个获得认证号的非官方站点。此外，我也和很多 Solar Network 社区上的朋友们之间交换了友链。


## ScophireSpace（二周目）

不过随着 2026 年 8 月，LyraVoid 大佬决定重构 Mizuki 并冠以 Shirone（白音）的全新名称，我对于优化博客的热情又燃起来了。

::github{repo=LyraVoid/Shirone}

仔细观察了项目，相较 Mizuki 的提升可谓非常巨大：

- [全新的架构](https://docs.shirone.mysqil.com/guide/project-structure)，使得配置文件全部整齐收敛在了`/src/config/`，资源文件全部放在`/public/`，改配置终于不会晕了
- 功能更加精简，没有用的看板娘和樱花飘落效果被砍掉了
- 部分 UI 重写，更加简约大方

因此，我毫不犹豫决定以完全重构的方式，将 ScophireSpace 底层迁移到 Shirone 模板。

与此同时，在 Mizuki 的折腾过程中慢慢长进的技术，也让我的重构计划比以往更有条理，更优雅。尤其是对于 vibe coding 的掌握，使我能够更加自由地建设我的博客，能在 Shirone 的基础上新增更多自定义内容。

成果就是您眼前的这个全新的网站，希望您享受其中，谢谢！