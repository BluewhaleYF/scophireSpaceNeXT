# 合并上游 Shirone 更新

本仓库是 **ScophireSpace 个人站**，已在 GitHub 上解除 fork 关系，但保留手动合并
上游主题更新的能力。合并由 agent 执行，人类只做审阅与最终放行。

上游：`LyraVoid/Shirone`（主题作者仓库）。本仓库的 `src/components`、`src/styles`、
`src/scripts`、`src/integration` 等主题代码来自上游；`src/content`、`src/data`、
`src/config` 已被个人内容替换；`tests/` 已按"内容无关"原则裁剪。

## 0. 一次性配置

```bash
git remote add upstream https://github.com/LyraVoid/Shirone.git
git fetch upstream
```

确认 `git remote -v` 同时有 `origin`（个人站）与 `upstream`（只读来源）。
不要给 `upstream` 配 push 权限。

## 1. 合并前基线

合并开始时工作区必须干净；先跑一次门禁，确认**合并前就是绿的**，否则无法判断
新红灯是不是合并引入的：

```bash
git status --short          # 必须为空
pnpm merge:check            # 必须全绿
```

## 2. 标准流程

```bash
git fetch upstream
git switch -c merge/upstream-YYYYMMDD
git merge --no-commit upstream/main    # 或指定的 tag/commit
```

有冲突时按第 3 节处理。解决后：

```bash
git add <冲突文件>
git commit                              # 写清楚合并的上游范围（tag/SHA）
pnpm install                            # 上游可能改了依赖
pnpm merge:check                        # 必须全绿
pnpm merge:check --build                # 高风险改动时追加
```

最后开 PR 或推送到 `merge/upstream-YYYYMMDD` 分支，**不要直接推 `main`**。
PR 描述里附上：上游 SHA、`merge:check` 结果、人工审阅过的页面清单。

## 3. 冲突策略

| 路径 | 策略 |
| --- | --- |
| `src/content/**` | 保留本地。个人文章、关于页、spec 页与上游 demo 内容无关。 |
| `src/data/**` | 保留本地。友链、设备、项目、时间线等是个人数据。 |
| `src/config/**` | 逐项比对。个人身份/导航/功能开关保留本地；上游新增的配置项要补进来。 |
| `src/i18n/**` | 以上游为主。文案键是主题契约，本地只允许新增个人化文案。 |
| `src/components/**`、`src/styles/**`、`src/scripts/**`、`src/integration/**` | 以上游为主；合并后跑 `--build` 并抽查页面。 |
| `package.json` / `pnpm-lock.yaml` | 逐条比对依赖与脚本，不要整块覆盖。 |
| `tests/**` | 见第 4 节。 |
| `.github/workflows/ci.yml` | 保留本仓库的三段式（quality / checks / build），不要恢复上游的评论与样式通道。 |

## 4. 测试目录的本地约定

本仓库的 Playwright 套件已裁剪为**内容无关的冒烟集**，位于 `tests/site/`。
它不绑定 demo 文章 slug、不绑定个人数据条数，目标是"合并后能变绿"。

- 上游新增且依赖 demo 内容的 spec（引用 `/posts/guide/`、MDX 示例、`Examples`
  分类等）：**不要合并进来**，按本地删除处理。
- 上游修改了我们已删除的 spec：冲突选择"保持删除"（`git rm <file>`）。
- 上游新增、且不依赖具体内容的契约测试：可以保留，但必须能在个人内容上跑通；
  跑不通就改成内容无关（从首页发现文章、按 DOM 动态取数量），或删除。
- 上游新增的 Node 单测（`tests/**/*.test.mjs`）：优先保留，它们通常不依赖内容。

裁剪记录：原 69 个 spec 中仅保留 15 个并新增 2 个（`a11y`、`post`、`taxonomy`、
`post-list`、`top-app-bar`、`layout-stability` 已改写为内容无关）。删除清单可由
`git log --diff-filter=D --name-only` 查看。

## 5. 高风险区域

以下改动合并后必须追加 `pnpm merge:check --build` 并人工抽查：

- Markdown 插件链（`src/plugins/**`、`src/utils/markdown-processor.*`）
- 样式与设计 token（`src/styles/**`、`DESIGN.md`、`docs/m3e-standard.md`）
- Swup 持久壳与侧栏（`src/layouts/**`、`src/components/organisms/SideBar.astro`）
- 打包/集成（`src/integration/**`、`package.json` 的 `files`/`exports`）
- 字体管线（`src/scripts/fonts/**`、`src/styles/font*`）

## 6. 禁止事项

- 不要 `git push --force` 到 `main`。
- 不要 `git add -A`：会带上个人内容或临时文件。
- 不要为了"让 CI 绿"而恢复 demo 内容或放宽断言；要么改写成内容无关，要么删除。
- 不要合并上游的 `research/`、示例文章与 demo 数据。
- 合并失败时不要就地修补到"看起来能跑"，回到分支起点重来。

## 7. 回滚

合并尚未推送：

```bash
git reset --hard origin/main      # 丢弃 merge 分支上的所有本地提交
```

已经推送但尚未上线：用 `git revert -m 1 <merge-commit>` 生成回滚提交，或直接
从 `origin/main` 重建分支。

## 8. 可选：跑上游完整契约套件

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
