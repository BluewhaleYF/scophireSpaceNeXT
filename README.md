<div align="center">

<img src="./public/logo/icon.png" width="88" height="88" alt="ScophireSpace logo" />

# ScophireSpace

**Flint Scophire 的个人博客，基于 [Shirone](https://github.com/LyraVoid/Shirone) 主题定制。**

[线上站点](https://scophire.space/) · [归档](https://scophire.space/archive/) · [友链](https://scophire.space/friends/) · [RSS](https://scophire.space/rss.xml)

![Astro 7](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js >= 22.12](https://img.shields.io/badge/Node.js-%3E%3D22.12-5FA04E?logo=nodedotjs&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg)](./LICENSE)

</div>

## 关于这个仓库

这是 [ScophireSpace](https://scophire.space/) 的完整源码，一个基于 [Shirone](https://github.com/LyraVoid/Shirone) 的个人博客站点。

> 如果你想用 Shirone 搭建自己的站点，请优先阅读[上游项目](https://github.com/LyraVoid/Shirone)及其文档。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | [Astro 7](https://astro.build/)（SSR 优先，静态输出） |
| 交互 | [Svelte 5](https://svelte.dev/)（runes，按需水合交互岛） |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com/) + [Stylus](https://stylus-lang.com/) + M3E 设计令牌 |
| 导航 | [Swup](https://swup.js.org/)（无刷新站内跳转 + 持久化外壳） |
| 搜索 | [Pagefind](https://pagefind.app/)（构建期生成的全文索引） |
| 测试 | [Playwright](https://playwright.dev/) + axe-core + Biome |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) **22.12+**
- [pnpm](https://pnpm.io/) **11.x**（仓库通过 `packageManager` 固定为 `pnpm@11.28.2`）

### 本地运行

```bash
git clone https://github.com/BluewhaleYF/scophireSpaceNeXT.git
cd scophireSpaceNeXT
corepack enable
pnpm install
pnpm dev
```

打开 `http://localhost:4321`。在 Windows PowerShell 中若脚本执行受限，请改用 `pnpm.cmd` / `npx.cmd`。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建站点、生成 Pagefind 索引并校验字体，输出到 `dist/` |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | Astro 类型与模板诊断 |
| `pnpm type-check` | TypeScript 严格检查 |
| `pnpm format` / `pnpm lint` | Biome 格式化 / 自动修复（会写文件） |
| `pnpm test` | 运行 Playwright 测试 |
| `pnpm new-post <filename>` | 创建新文章 |
| `pnpm check:manifest` | 校验组件、Markdown 语法、技能与字体清单 |
| `pnpm lighthouse` | 桌面端 Lighthouse 审计 |

## 目录结构

```text
.
├── src/
│   ├── config/        # 站点、导航、侧栏与各功能页配置（唯一配置入口）
│   ├── data/          # 友链、罗盘、项目、技能等页面数据
│   ├── content/       # 文章（posts）与动态（moments）
│   ├── assets/        # 构建期优化的图片、字体等资源
│   ├── components/    # atoms / molecules / organisms 分层组件
│   ├── layouts/       # 页面模板
│   ├── pages/         # 路由与页面编排
│   ├── plugins/       # Markdown 扩展、语法清单与运行时
│   ├── i18n/          # 界面文案与十种语言
│   └── integration/   # Astro 集成（同时支撑 npm 包模式）
├── public/            # 原样输出的静态文件（favicon、logo、相册等）
├── docs/              # 设计、Markdown、侧栏、打包等开发文档
├── rules/             # 项目规则与常见陷阱
├── scripts/           # 内容同步、构建与维护脚本
└── tests/             # 单元测试与 Playwright 站点测试
```

## 写内容

文章放在 `src/content/posts/`，支持 Markdown 与 MDX；动态放在 `src/content/moments/`。

### 最小化

```yaml
---
title: 我的第一篇文章
published: 2026-10-30
description: 列表与元信息中展示的摘要。
image: ./cover.webp
tags: [Astro, Notes]
category: 技术
draft: false
---

正文……
```

### 最大化

```yaml
---
title: 文章标题
published: 2026-10-30                    # 必填，日历日期
publishedAt: 2026-10-30T09:30:00+08:00   # 可选，精确发布时间；须与 published 同一天（站点时区）
updated: 2026-11-02                      # 可选，更新日期
updatedAt: 2026-11-02T14:20:00+08:00     # 可选，精确更新时间；须与 updated 同一天
description: 列表与元信息中展示的摘要
image: ./cover.webp                      # 封面：相对路径 / public 绝对路径 / 远程 URL
tags: [Astro, Notes]
category: 技术
lang: zh-CN                              # 覆盖站点默认的渲染语言
pinned: false                            # 置顶
draft: false                             # 草稿
comment: true                            # 文章级评论开关，继承全局配置
series: markdown-syntax-guide            # 所属系列 slug，留空表示普通文章
seriesOrder: 1                           # 系列内顺序，缺省按发布日期
alias: my-first-post                     # 备用 slug
permalink: /posts/my-first-post/         # 自定义根路径链接
license:                                 # 覆写全站版权声明；也可简写为 license: CC BY 4.0
  enable: true
  name: CC BY-NC-SA 4.0
  url: https://creativecommons.org/licenses/by-nc-sa/4.0/
  author:
    name: Flint Scophire
    url: https://scophire.space/
  source: https://example.com/original-post   # 转载来源；留空表示原创
encrypted: false                         # 加密文章
password: ""                             # 加密密码，字符串或数字
passwordHint: ""                         # 密码提示
hideHomeContent: true                    # 加密文章在首页 / Feed 隐藏正文
---

正文……
```

`prevUrl`、`prevTitle`、`prevSlug`、`nextUrl`、`nextTitle`、`nextSlug` 为系统内部字段，由构建流程维护，无需手写。

- 页面数据（友链、罗盘、项目、技能、时间线等）在 `src/data/`；页面行为与开关在 `src/config/`。
- 本地图片优先放进 `src/assets/`（构建期优化并输出带哈希地址）；`public/` 适合 favicon、相册等需要固定路径的资源。
- 自定义 Markdown 语法与写法见 [`docs/markdown-extensions.md`](./docs/markdown-extensions.md) 和 [`src/plugins/markdown/manifest.json`](./src/plugins/markdown/manifest.json)。

## 配置

配置遵循「配置管行为，数据管内容」：

| 文件 | 职责 |
| --- | --- |
| `src/config/siteConfig.ts` | 站点 URL、标题、语言、主题色、横幅、纹理、目录、favicon |
| `src/config/profileConfig.ts` | 博主头像、名称、简介、社交链接 |
| `src/config/navBarConfig.ts` / `sidebarConfig.ts` | 顶部导航与侧栏编排 |
| `src/config/friendsConfig.ts` | 友链页开关与申请卡片（邮箱、本站信息模板） |
| `src/config/compassConfig.ts` | 站点罗盘页开关与文案 |
| `src/config/commentConfig.ts` / `musicConfig.ts` / `umamiConfig.ts` | 可选评论、音乐与统计 |

完整契约见 [`src/config/README.md`](./src/config/README.md)。

## 部署

`pnpm build` 生成纯静态的 `dist/`，可部署到 Cloudflare、Vercel、Netlify、GitHub Pages 或任意静态托管。仓库自带 `wrangler.jsonc`（Cloudflare 静态资源，`dist/` 目录），使用其他平台时按平台要求调整即可。

部署前确认 `src/config/siteConfig.ts` 中的 `site` 与 `base`：

- 部署在域名根目录：`site: "https://example.com/"`，`base: "/"`；
- 部署在子路径（如 GitHub Pages 项目页）：`site: "https://username.github.io"`，`base: "/repo-name/"`。

若需要把内容拆到独立仓库（双仓模式），可直接参考 [`docs/content-separation/README.md`](./docs/content-separation/README.md) 与 [`.github/workflows/deploy.yml.example`](./.github/workflows/deploy.yml.example)。

## 与上游同步

本仓库从 `LyraVoid/Shirone` fork 而来并保留上游历史。同步上游更新：

```bash
git remote add upstream https://github.com/LyraVoid/Shirone.git   # 首次
git fetch upstream --prune
git merge upstream/main
```

合并后按需处理冲突，并运行 `pnpm check`、`pnpm type-check`、`pnpm build` 验证。建议把 `upstream` 的 push URL 禁用，避免误推到上游：

```bash
git remote set-url --push upstream DISABLED
```

## 文档

- [`AGENTS.md`](./AGENTS.md)：仓库结构与开发约束总览
- [`src/config/README.md`](./src/config/README.md)：配置契约
- [`docs/m3e-standard.md`](./docs/m3e-standard.md)：设计令牌与组件标准
- [`docs/atomic-structure.md`](./docs/atomic-structure.md)：组件分层与依赖方向
- [`docs/markdown-extensions.md`](./docs/markdown-extensions.md)：Markdown 插件与验证
- [`docs/sidebar-system.md`](./docs/sidebar-system.md)：侧栏编排与 Swup 同步
- [`rules/pitfalls.md`](./rules/pitfalls.md)：常见陷阱与排查清单

## 致谢

- [Shirone](https://github.com/LyraVoid/Shirone)：本项目的上游主题与 M3E 设计体系；
- [Fuwari](https://github.com/saicaca/fuwari)：Shirone 最初的设计与结构来源；
- [Chaos的小站](https://www.nachaos.xyz/)：本站部分灵感来源；
- [Astro](https://astro.build/)、[Svelte](https://svelte.dev/)、[Swup](https://swup.js.org/) 及所有开源依赖的作者。

## License

基于 [MIT License](./LICENSE) 发布。作为 Shirone 的衍生项目，本仓库保留上游要求的原始版权声明。
