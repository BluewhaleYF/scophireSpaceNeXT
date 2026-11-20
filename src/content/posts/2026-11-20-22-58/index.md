---
title: 如何将 Shirone 部署在 Cloudflare Workers 上
published: 2026-11-20
publishedAt: 2026-11-20T23:00:00+08:00
description: 绕开官方警告，把 Shirone 静态站直接部署到 Cloudflare Workers 的记录
tags: [Blog]
category: 技术
draft: false
series: blog-construction
---

本站基于 Shirone，一个非常优秀的 Astro 静态博客模板。为了部署它，我选择了 Cloudflare Workers 平台。

可是，在 Shirone 的官方文档中，Cloudflare Workers 被明确列为了不兼容：

> “必须创建 Pages 项目，切勿创建为 Worker。若选错项目类型，构建时将报错 `__dirname is not defined`。”（[来源](https://docs.shirone.mysqil.com/guide/deploy/cloudflare/#%E5%89%8D%E7%BD%AE%E6%9D%A1%E4%BB%B6)）

的确，对于 Shirone 这种静态站，Pages 确实是专长，而部署在 Workers 这个专注边缘计算的平台确实略显奇怪。

## 为什么偏要部署到 Workers？

原因是近期 Cloudflare 官方正在针对 Pages 和 Workers 做一个路线调整：

根据官方的[博客](https://blog.cloudflare.com/zh-cn/full-stack-development-on-cloudflare-workers/)，原本属于 Pages 静态托管、构建、预览的功能，正在被逐步引入 Workers，Cloudflare 未来的所有投资、优化、新功能都将投放在 Workers，且官方建议新项目尽量从 Workers 开始。目前，Workers 官方已经说明了 Astro 这类静态项目能够兼容。

ScophireSpace 二周目是一个从重构中开始的全新项目，因此我就选择跟上时代，将项目部署从 Pages 迁移到了 Workers，以面向更长期、更完整的平台能力。

::: warning
这只是我个人的实验性尝试，如果您想部署自己的 Shirone 实例作为博客，还请遵循[官方文档](https://docs.shirone.mysqil.com/guide/deploy/cloudflare/)中当前最稳定的做法。
:::


## 官方警告的原因

目前直接把 Shirone 部署到 Cloudflare Workers 确实是会构建不成功的，原因有下：

1. 目前的 Shirone 模板没有 `wrangler.jsonc`，部署时 Wrangler 会自动探测框架，发现是 Astro 就触发 `astro add cloudflare`，试图把项目改成 SSR Worker 模式。但 Shirone 是纯静态站，只需要把 `dist/` 传上去，完全不需要 Worker 入口。
2. Astro 的某些构建路径 / 适配器代码里隐式依赖了 Node 的 `__dirname`，而 Worker 运行时没有 Node 全局变量，一旦被当成 Worker 入口去跑就会炸掉。

## 解决方案

### Cloudflare 官方方案

不过 Cloudflare 官方已经给出了专门针对 Astro 的解决方案，以下内容来源于[官方文档](https://blog.cloudflare.com/zh-cn/full-stack-development-on-cloudflare-workers/#静态站点)：

> 如果您有由静态站点生成器（SSG）（如 Astro）创建的静态站点，您只需创建一个 wrangler.jsonc 文件（或 wrangler.toml ），并告诉 Cloudflare 在哪里找到您的已构建资产：

```jsonc
// wrangler.jsonc 

{
  "name": "my-static-site",
  "compatibility_date": "2025-04-01",
  "assets": {
    "directory": "./dist",
  }
}
```

> 添加此配置后，您只需构建项目并运行 `wrangler deploy` 命令。您的整个站点将被上传，并准备好通过 Workers 处理流量。一旦部署并开始接收请求，您的静态站点将被缓存到 Cloudflare 网络中。


不过官方的文档中给出的只是框架，实际上 Astro 还需要配置静态输出目录和 404 页面位置，因此仍然需要进一步修改。

### 我的优化方案

在根目录新建 `wrangler.jsonc`，里面写入

```jsonc
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"name": "[Your_Project_Name]",
	"compatibility_date": "2026-01-01",
	"assets": {
		"directory": "./dist",
		"not_found_handling": "404-page"
	}
}
```

通过 `wrangler.jsonc` 声明 `assets.directory`，Wrangler 会跳过框架探测，直接把 `dist/` 当静态文件上传。没有 Worker 入口脚本，adapter 不会被注入，`__dirname` 相关代码自然不会被执行。

这一方案已经被使用到了 ScophireSpace 的构建兼容措施中，具体的 commit 在：