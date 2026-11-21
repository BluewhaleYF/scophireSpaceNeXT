# Test Scope

本目录是**个人站**的测试集，不是上游主题的完整契约套件。`tests/site/` 只保留
内容无关的冒烟用例：不引用 demo 文章 slug，不断言个人数据的条数或具体条目。
合并上游时的验收流程见 [`../docs/upstream-merge.md`](../docs/upstream-merge.md)。

- Use the repository Playwright configuration: `npx.cmd playwright test ...`, the configured Chrome channel, one worker, and the automatic Astro dev server. Do not add a competing server or browser setup in an individual spec without a documented reason.
- Mock external APIs and unstable network/media responses. Keep test data deterministic and use semantic roles, labels, stable `data-*` contracts, or scoped selectors instead of incidental DOM position.
- Before computed-style or accessibility assertions, wait for theme initialization (`--mc-primary`), required islands, and `onload-animation` convergence. Exercise `prefers-reduced-motion` for motion-sensitive behavior and assert that reduced-motion paths settle without animation.
- Features involving persistent shell elements must cover both direct page load and Swup navigation. Assert the route contract after `content:replace` rather than assuming the shell was rerendered.
- Keep visual snapshots local and intentional. They are ignored by Git; do not update them to absorb unrelated viewport, font, page-height, or cache drift. Use DOM geometry/state assertions when a screenshot is unavailable or the difference is not attributable to the change.
- Select the narrowest relevant fragment, then add `tests/site/a11y.spec.ts` for page/component changes. Typography or Markdown-pipeline changes should also run `tests/site/markdown-smoke.spec.ts`.
- Do not reintroduce specs that depend on demo content or fixed personal data (post slugs, friend counts, category names). Discover routes at runtime or assert structure; see the keep/delete rationale in `docs/upstream-merge.md` §4.
- `pnpm merge:check` is the merge gate: `astro check`, read-only Biome, unit tests, and the Playwright smoke set. Add `--build` for high-risk merges.
