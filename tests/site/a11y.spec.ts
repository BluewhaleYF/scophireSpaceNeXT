import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * 真实站点页面 A11y 锁定（axe-core / WCAG 2.1 AA）
 * 与 tests/atoms/a11y.spec.ts（原子测试页）互补：这里扫描博客真实页面
 * （首页 / 归档 / 关于 / 分类 / 标签 / 一篇文章），覆盖整站语义结构
 * （header/nav/aside landmark）、内容层（Markdown）与深色模式下的对比度。
 * 文章页路径从首页发现，避免绑定上游 demo 文章或当前个人文章的固定 slug。
 * 说明：
 * - 扫描前等待 onload-animation 全部收敛（opacity 1），防止动画中间帧误报。
 * - 断言页面确实处于目标模式，防止主题未应用导致“假通过”。
 */
const FIRST_POST = "__first-post__";

const pages = [
	{ name: "404", path: "/404/" },
	{ name: "首页", path: "/" },
	{ name: "首页-网格", path: "/", layout: "grid" },
	{ name: "归档", path: "/archive/" },
	{ name: "关于", path: "/about/" },
	{ name: "分类索引", path: "/categories/" },
	{ name: "标签索引", path: "/tags/" },
	{ name: "文章页", path: FIRST_POST },
];

const DISABLED_RULES = ["page-has-heading-one"];

const modes = [
	{ name: "light", theme: "light", dark: false },
	{ name: "dark", theme: "dark", dark: true },
];

const GITHUB_MOCK = {
	description: "A static blog template built with Astro.",
	language: "TypeScript",
	stargazers_count: 4860,
	forks_count: 1243,
	owner: {
		avatar_url:
			"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='12' fill='%236366f1'/></svg>",
	},
	license: { spdx_id: "MIT" },
};

async function openSitePage(
	page: Page,
	path: string,
	theme: string,
	layout?: string,
) {
	await page.addInitScript(
		(entries) => {
			for (const [key, value] of Object.entries(entries))
				localStorage.setItem(key, value);
		},
		{ theme, ...(layout ? { "post-list-mode": layout } : {}) },
	);
	await page.route("https://api.github.com/**", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(GITHUB_MOCK),
		}),
	);
	await page.goto(path, { waitUntil: "domcontentloaded" });
	// 等待配色就绪（默认配色为静态 CSS；非默认配色由 HCT 写入 :root）
	await page.waitForFunction(() => {
		const root = document.documentElement;
		return getComputedStyle(root)
			.getPropertyValue("--mc-primary")
			.trim()
			.startsWith("#");
	});
	// 等待 onload-animation 全部收敛（跳过 display:none 元素），防止动画中间帧
	await page.waitForFunction(
		() => {
			const els = [...document.querySelectorAll(".onload-animation")];
			return els.every((el) => {
				if ((el as HTMLElement).offsetParent === null) return true;
				return getComputedStyle(el).opacity === "1";
			});
		},
		undefined,
		{ timeout: 15_000 },
	);
	// Svelte 客户端挂载（归档页 client:only 需 onMount 构建分组）
	await page.waitForTimeout(500);
}

/** 从首页发现第一篇文章的真实路径。 */
async function discoverFirstPost(page: Page): Promise<string> {
	await page.goto("/", { waitUntil: "domcontentloaded" });
	const href = await page
		.locator('#post-list a[href*="/posts/"]')
		.first()
		.getAttribute("href");
	if (!href) throw new Error("首页没有找到任何文章链接");
	return href;
}

for (const mode of modes) {
	test.describe(`Site a11y scan lock (${mode.name})`, () => {
		for (const p of pages) {
			test(p.name, async ({ page }) => {
				const path =
					p.path === FIRST_POST ? await discoverFirstPost(page) : p.path;
				await openSitePage(page, path, mode.theme, p.layout);
				// 防止主题未应用导致“假通过”：确认页面确实处于目标模式
				const isDark = await page.evaluate(() =>
					document.documentElement.classList.contains("dark"),
				);
				expect(isDark, `${p.name} theme should be ${mode.name}`).toBe(
					mode.dark,
				);
				const results = await new AxeBuilder({ page })
					.disableRules(DISABLED_RULES)
					.analyze();
				const summary = results.violations.map((v) => ({
					id: v.id,
					impact: v.impact,
					nodes: v.nodes.map((n) => n.target.join(" ")),
				}));
				expect(
					summary,
					`${p.name} has accessibility violations (${mode.name})`,
				).toEqual([]);
			});
		}
	});
}
