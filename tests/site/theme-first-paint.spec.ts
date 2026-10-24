import { expect, test } from "@playwright/test";

/**
 * 首屏配色契约（慢网络下不闪回退色）：
 * `--mc-*` 角色值由「构建期内联的默认方案」+「<head> 内联脚本应用的访客缓存方案」
 * 提供，而不是等延迟加载的引擎模块脚本。侧栏「分类 / 系列」的数量徽标正是
 * `--secondary-container` 的高饱和用法：修复前慢网络下它会先显示
 * variables.styl 的 oklch 回退色（色相 +65°，hue 230 亮色为 #e0d8fd），
 * 与主题实际配色（#d0e6f2）明显不同。
 */

const BADGE = ".m3-blog-categorylist__badge";

/** 主题引擎已把方案写进 `:root` 内联样式（既有测试共用的就绪条件） */
async function waitForEngine(page: import("@playwright/test").Page) {
	await page.waitForFunction(() =>
		document.documentElement.style
			.getPropertyValue("--mc-primary")
			.trim()
			.startsWith("#"),
	);
}

async function badgeBackground(page: import("@playwright/test").Page) {
	const badge = page.locator(BADGE).first();
	await expect(badge).toBeVisible();
	return badge.evaluate((el) => getComputedStyle(el).backgroundColor);
}

test("无 JS 时首帧徽标已是主题配色（构建期内联方案）", async ({ browser }) => {
	const ssrContext = await browser.newContext({ javaScriptEnabled: false });
	const ssrPage = await ssrContext.newPage();
	await ssrPage.goto("/", { waitUntil: "domcontentloaded" });
	const ssrBackground = await badgeBackground(ssrPage);
	await ssrContext.close();

	// 引擎执行后的颜色就是主题色；SSR 首帧必须与它一致，而不是 oklch 回退色。
	const jsContext = await browser.newContext();
	const jsPage = await jsContext.newPage();
	await jsPage.addInitScript(() => localStorage.setItem("theme", "light"));
	await jsPage.goto("/", { waitUntil: "domcontentloaded" });
	await waitForEngine(jsPage);
	const engineBackground = await badgeBackground(jsPage);
	await jsContext.close();

	expect(ssrBackground).toBe(engineBackground);
});

declare global {
	interface Window {
		/** 引擎写入前，`<head>` 内联脚本留下的第一个 `--mc-secondary-container` */
		__firstSecondary?: string | null;
	}
}

test("内联方案覆盖暗色角色，与引擎的暗色方案一致", async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem("theme", "dark"));
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await waitForEngine(page);

	const state = await page.evaluate(() => {
		const fromStylesheet = (selector: string): string => {
			for (const sheet of document.styleSheets) {
				let rules: CSSRuleList;
				try {
					rules = sheet.cssRules;
				} catch {
					continue; // 跨域样式表不可读；内联 <style> 一定同源
				}
				for (const rule of rules) {
					if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
						return rule.style
							.getPropertyValue("--mc-secondary-container")
							.trim();
					}
				}
			}
			return "";
		};
		return {
			inlineDark: fromStylesheet(":root.dark"),
			engineDark: document.documentElement.style
				.getPropertyValue("--mc-secondary-container")
				.trim(),
			isDark: document.documentElement.classList.contains("dark"),
		};
	});

	expect(state.isDark).toBe(true);
	expect(state.inlineDark).toMatch(/^#[0-9a-f]{6}$/);
	expect(state.inlineDark).toBe(state.engineDark);
});

test("访客自定义配色在引擎写入前由缓存方案接管", async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem("theme", "light");
		localStorage.setItem("hue", "345");
		localStorage.setItem(
			"mc-scheme-cache",
			JSON.stringify({
				hue: 345,
				style: "tonalSpot",
				spec: "2021",
				light: {
					"--mc-secondary-container": "#123456",
					"--mc-on-secondary-container": "#ffffff",
				},
			}),
		);
		// 记录第一次写入 `--mc-secondary-container` 的值：`<head>` 内联脚本在解析
		// 阶段先写（缓存方案），延迟模块脚本 / 水合岛随后才由引擎覆盖。
		window.__firstSecondary = null;
		const original = CSSStyleDeclaration.prototype.setProperty;
		CSSStyleDeclaration.prototype.setProperty = function (
			name: string,
			value: string | null,
			priority?: string,
		) {
			if (name === "--mc-secondary-container" && !window.__firstSecondary) {
				window.__firstSecondary = value;
			}
			return original.call(this, name, value ?? "", priority);
		};
	});
	await page.goto("/", { waitUntil: "domcontentloaded" });

	expect(await page.evaluate(() => window.__firstSecondary)).toBe("#123456");

	// 引擎随后接管为 hue 345 的真实方案：缓存只负责首帧，不是最终态。
	await waitForEngine(page);
	expect(await badgeBackground(page)).toBe("rgb(251, 217, 234)");
});

test("引擎把当前方案写入缓存，键与内联读取端一致", async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem("theme", "light"));
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await waitForEngine(page);

	const state = await page.evaluate(() => ({
		cache: JSON.parse(localStorage.getItem("mc-scheme-cache") || "null"),
		secondary: document.documentElement.style
			.getPropertyValue("--mc-secondary-container")
			.trim(),
	}));

	expect(state.cache).not.toBeNull();
	expect(state.cache.style).toBe("tonalSpot");
	expect(state.cache.spec).toBe("2021");
	expect(state.cache.hue).toBe(230);
	expect(state.cache.light["--mc-secondary-container"]).toBe(state.secondary);
});
