# 合并上游 Shirone 更新

本仓库是 **ScophireSpace 个人站**，已在 GitHub 上解除 fork 关系，但保留手动合并
上游主题更新的能力。合并由 agent 执行，但**每次都必须先审查上游改动并汇报**；
存在风险或与本地自定义冲突时，必须由人类拍板后才能继续合并与修改。

上游：<https://github.com/LyraVoid/Shirone>（主题作者仓库）。本仓库的 `src/components`、
`src/styles`、`src/scripts`、`src/integration` 等主题代码来自上游；`src/content`、
`src/data`、`src/config` 已被个人内容替换；`tests/` 已按"内容无关"原则裁剪。

## 0. 一次性配置

```bash
git remote add upstream https://github.com/LyraVoid/Shirone
git fetch upstream
```

确认 `git remote -v` 同时有 `origin`（个人站）与 `upstream`（只读来源）。
不要给 `upstream` 配 push 权限。

## 1. 先审查上游改动（强制，不得跳过）

每次准备更新上游，agent 都必须先完成本节，再决定是否进入第 3 节。
**在审查结论得到用户明确确认之前，不得执行 `git merge`，也不得改写任何本地文件。**

### 1.1 取回并列出范围

```bash
git fetch upstream
base=$(git merge-base HEAD upstream/main)
git log --oneline --no-merges "$base"..upstream/main
git diff --stat "$base"..upstream/main
```

记录上游范围（起止 SHA、是否 tag）、提交数量、改动文件清单，并按目录分组。

### 1.2 研究适不适合合并

对每个改动域给出结论：

| 检查项 | 关注点 |
| --- | --- |
| 本地自定义是否被触及 | `src/content`、`src/data`、`src/config`、`tests`、CI、`AGENTS.md`/docs、`DESIGN.md` |
| 行为契约是否变化 | Markdown 语法、配置 schema、路由、Swup 生命周期、i18n 键 |
| 是否需要迁移 | 配置项重命名/删除、字体/图标/依赖升级、内容 frontmatter |
| 依赖与运行时 | `package.json`、`pnpm-lock.yaml`、Node/Astro/Svelte 版本 |
| 测试影响 | 上游新增/修改的 spec 是否依赖 demo 内容（见第 5 节） |

### 1.3 停止条件（必须先告知用户并等待回复）

命中以下任一条件时，先汇报、等指令，**不要自行决定继续**：

- 命中第 6 节的高风险区域；
- 改动与本地自定义文件重叠，或需要改写/删除本地内容、配置、测试、CI、脚本；
- 上游引入配置 schema、路由或 Markdown 语法的破坏性变化；
- 上游重命名或删除了我们正在使用的文件、导出、配置项；
- 你无法确定某处行为影响，或评估证据不足。

汇报时必须说清：**改了什么 → 和本地哪处冲突 → 合并后可能发生什么 → 建议做法
（合并 / 部分合并 / 跳过 / 改写）→ 需要用户拍板的具体问题**。不要用"应该没问题"
之类没有依据的结论代替评估。

### 1.4 评估报告

在会话中（或 PR 描述里）留下：

- 上游范围：起止 SHA、提交数、是否 tag；
- 高风险与冲突清单（逐项对应第 6 节/第 4 节）；
- 每项的建议与取舍；
- 是否需要追加 `pnpm merge:check --build`；
- 仍需用户确认的问题（没有则写明"无"）。

审查通过并确认无待决问题后，再进入第 2 节。

## 2. 合并前基线

合并开始时工作区必须干净；先跑一次门禁，确认**合并前就是绿的**，否则无法判断
新红灯是不是合并引入的：

```bash
git status --short          # 必须为空
pnpm merge:check            # 必须全绿
```

## 3. 标准流程

只有第 1 节审查通过、且没有待用户确认的事项后，才执行：

```bash
git switch -c merge/upstream-YYYYMMDD
git merge --no-commit upstream/main    # 或指定的 tag/commit
```

有冲突时按第 4 节处理。解决后：

```bash
git add <冲突文件>
git commit                              # 写清楚合并的上游范围（tag/SHA）
pnpm install                            # 上游可能改了依赖
pnpm merge:check                        # 必须全绿
pnpm merge:check --build                # 高风险改动时追加
```

最后开 PR 或推送到 `merge/upstream-YYYYMMDD` 分支，**不要直接推 `main`**。
PR 描述里附上：上游 SHA、评估报告、`merge:check` 结果、人工审阅过的页面清单。

## 4. 冲突策略

| 路径 | 策略 |
| --- | --- |
| `src/content/**` | 保留本地。个人文章、关于页、spec 页与上游 demo 内容无关。 |
| `src/data/**` | 保留本地。友链、设备、项目、时间线等是个人数据。 |
| `src/config/**` | 逐项比对。个人身份/导航/功能开关保留本地；上游新增的配置项要补进来。 |
| `src/i18n/**` | 以上游为主。文案键是主题契约，本地只允许新增个人化文案。 |
| `src/components/**`、`src/styles/**`、`src/scripts/**`、`src/integration/**` | 以上游为主；合并后跑 `--build` 并抽查页面。 |
| `package.json` / `pnpm-lock.yaml` | 逐条比对依赖与脚本，不要整块覆盖。 |
| `tests/**` | 见第 5 节。 |
| `.github/workflows/ci.yml` | 保留本仓库的三段式（quality / checks / build），不要恢复上游的评论与样式通道。 |

## 5. 测试目录的本地约定

本仓库的 Playwright 套件已裁剪为**内容无关的冒烟集**，位于 `tests/site/`。
它不绑定 demo 文章 slug、不绑定个人数据条数，目标是"合并后能变绿"。

- 上游新增且依赖 demo 内容的 spec（引用 `/posts/guide/`、MDX 示例、`Examples`
  分类等）：**不要合并进来**，按本地删除处理。
- 上游修改了我们已删除的 spec：冲突选择"保持删除"（`git rm <file>`）。
- 上游新增、且不依赖具体内容的契约测试：可以保留，但必须能在个人内容上跑通；
  跑不通就改成内容无关（从首页发现文章、按 DOM 动态取数量），或删除。
- 上游新增的 Node 单测（`tests/**/*.test.mjs`）：优先保留，它们通常不依赖内容。

裁剪记录：原 69 个 spec 中仅保留 15 个并新增 2 个（`markdown-smoke`、
`comments-zero-footprint`），合并 v2.0.0 时又保留了上游的 `swup-navigation`，
当前为 18 个。`a11y`、`post`、`taxonomy`、`post-list`、`top-app-bar`、
`layout-stability` 已改写为内容无关。上游新增的 `list-pagination`、
`anime-filters`、`moments-encrypted` 依赖 demo/夹具内容，未合并。删除清单可由
`git log --diff-filter=D --name-only` 查看。

## 6. 高风险区域

以下改动合并后必须追加 `pnpm merge:check --build` 并人工抽查；命中时也属于
第 1.3 节的停止条件：

- Markdown 插件链（`src/plugins/**`、`src/utils/markdown-processor.*`）
- 样式与设计 token（`src/styles/**`、`DESIGN.md`、`docs/m3e-standard.md`）
- Swup 持久壳与侧栏（`src/layouts/**`、`src/components/organisms/SideBar.astro`）
- 打包/集成（`src/integration/**`、`package.json` 的 `files`/`exports`）
- 字体管线（`src/scripts/fonts/**`、`src/styles/font*`）
- 配置 schema 与路由表（`src/config/**`、`src/types/**`、`src/pages/**`）

## 7. 禁止事项

- 不要 `git push --force` 到 `main`。
- 不要 `git add -A`：会带上个人内容或临时文件。
- 不要在未完成第 1 节审查、未拿到用户确认时执行 merge 或改写本地文件。
- 不要为了"让 CI 绿"而恢复 demo 内容或放宽断言；要么改写成内容无关，要么删除。
- 不要合并上游的 `research/`、示例文章与 demo 数据。
- 合并失败时不要就地修补到"看起来能跑"，回到分支起点重来。

## 8. 回滚

合并尚未推送：

```bash
git reset --hard origin/main      # 丢弃 merge 分支上的所有本地提交
```

已经推送但尚未上线：用 `git revert -m 1 <merge-commit>` 生成回滚提交，或直接
从 `origin/main` 重建分支。

## 9. 可选：跑上游完整契约套件

需要对某个上游改动做更强验证时，可以在**临时 worktree** 里检出上游版本，
恢复上游 demo 内容后再跑它的完整 Playwright 套件。这只是诊断手段，不进入
本仓库的常规门禁：

```bash
git worktree add ../shirone-upstream upstream/main
cd ../shirone-upstream
pnpm install
pnpm exec playwright test tests/site
```

用完删除 worktree（`git worktree remove ../shirone-upstream`），不要把上游的
demo 内容或测试带回本仓库。
