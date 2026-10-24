import { expect, test } from "@playwright/test";

/**
 * 侧栏页面过滤契约：进入系列页（`/series/` 索引与 `/series/<slug>/` 详情，
 * 两者都输出 `page="series"`）后，分类 / 系列 / 标签 widget 必须保持可见。
 *
 * 回归背景：`SidebarPage` 与页面标识早已包含 "series"，但三个 widget 的
 * `pages` 清单没跟上，导致整块侧栏只剩作者卡片；直接加载与 Swup 导航
 * （侧栏在容器外、由 hooks 重新过滤）两条路径都要锁住。
 */

const CONTEXT_WIDGETS = ["categories", "series", "tags"] as const;

function widget(page: import("@playwright/test").Page, id: string) {
	return page.locator(`.sidebar-widget:has(#${id})`);
}

async function expectContextWidgetsVisible(
	page: import("@playwright/test").Page,
) {
	for (const id of CONTEXT_WIDGETS) {
		await expect(widget(page, id)).not.toHaveClass(/hidden/);
		// hidden 类去掉还不够：父组可能整体收起
		await expect(page.locator(`#${id}`)).toBeVisible();
	}
	// 过滤本身仍要生效：文章目录仅在 post 页出现
	await expect(widget(page, "toc")).toHaveClass(/hidden/);
}

test("直接加载系列页保留侧栏上下文 widget", async ({ page }) => {
	await page.goto("/series/", { waitUntil: "domcontentloaded" });
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"series",
	);
	await expectContextWidgetsVisible(page);
});

test("Swup 导航进系列页后侧栏重新过滤而不是整块消失", async ({ page }) => {
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await page.waitForFunction(() => Boolean(window.swup?.hooks));
	await expect(widget(page, "categories")).not.toHaveClass(/hidden/);

	await page.evaluate(() => window.swup?.navigate("/series/"));
	await page.waitForURL("**/series/");
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"series",
	);
	await expectContextWidgetsVisible(page);

	// 再点进具体系列：同一 page 标识，widget 应保持可见
	const detail = page.locator("#series .m3-blog-categorylist a").first();
	if ((await detail.count()) > 0) {
		await detail.click();
		await page.waitForURL("**/series/**");
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"series",
		);
		await expectContextWidgetsVisible(page);
	}
});
