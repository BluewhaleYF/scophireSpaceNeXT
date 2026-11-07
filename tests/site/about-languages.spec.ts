import { expect, test } from "@playwright/test";

/**
 * 关于页语言栏：锁定语言名称、代码、掌握程度的渲染，
 * 以及桌面横屏下四张卡片并排一行的布局契约。
 */
test.describe("关于页语言栏", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/about/", { waitUntil: "domcontentloaded" });
		await expect(page.locator(".language-card")).toHaveCount(4);
	});

	test("渲染标题、描述与每个语言的名称/代码/等级", async ({ page }) => {
		await expect(
			page.locator(".about-languages .section-title__title"),
		).toHaveText("语言");
		await expect(
			page.locator(".about-languages .section-title__subtitle"),
		).toHaveText("我所掌握和正在学习的语言");

		const expected = [
			{ name: "中文", code: "zh_CN, zh_TW", level: "母语" },
			{ name: "闽南语", code: "zh_nan", level: "母语" },
			{ name: "English", code: "en_US", level: "CEFR B2" },
			{ name: "日本語", code: "ja_JP", level: "N5" },
		];

		for (const [index, item] of expected.entries()) {
			const card = page.locator(".language-card").nth(index);
			await expect(card.locator(".language-card__name")).toHaveText(item.name);
			await expect(card.locator("code")).toHaveText(item.code);
			await expect(card.locator(".language-card__level")).toContainText(
				item.level,
			);
		}
	});

	test("桌面横屏下四张卡片并排一行", async ({ page }) => {
		const tops = await page
			.locator(".language-card")
			.evaluateAll((cards) =>
				cards.map((card) => Math.round(card.getBoundingClientRect().top)),
			);
		expect(new Set(tops).size).toBe(1);
	});
});
