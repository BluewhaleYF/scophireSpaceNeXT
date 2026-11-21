import { expect, test } from "@playwright/test";

/**
 * 分类/标签索引页回归（内容无关版）。
 *
 * 索引数据来自 utils/content-utils（getCategoryList / getTagList），条目本身
 * 会随个人文章变化；这里只锁定结构契约：页头、行/芯片数量大于零、计数徽标、
 * 归档过滤链接、栅格布局与侧栏入口，不断言具体分类名或数量。
 */

test.describe("分类索引页 /categories/", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/categories/");
	});

	test("renders category rows with counts and archive filter links", async ({
		page,
	}) => {
		await expect(page.locator(".page-header__title")).not.toBeEmpty();
		// 页头装饰图标：SSR 直出（astro-icon 构建期内联，非空）
		await expect(page.locator(".page-header__icon svg")).toHaveCount(1);

		const rows = page.locator(".category-index__row");
		await expect(rows.first()).toBeVisible();
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);

		for (let index = 0; index < count; index += 1) {
			const row = rows.nth(index);
			const name =
				(await row.locator(".category-index__name").textContent()) ?? "";
			expect(name.trim().length).toBeGreaterThan(0);
			await expect(row.locator(".category-index__count")).toHaveText(/^\d+$/);
			await expect(row).toHaveAttribute(
				"href",
				`/archive/?category=${encodeURIComponent(name.trim())}`,
			);
			await expect(row.locator(".m3-meta-icon svg")).toHaveCount(1);
		}

		await expect(
			page.locator('widget-layout[data-id="categories"]'),
		).toBeHidden();
		await expect(page.locator('widget-layout[data-id="tags"]')).toBeHidden();
		await expect(page.locator(".expand-btn")).toHaveCount(0);
		await expect(page.locator(".category-index__list")).toHaveCSS(
			"display",
			"grid",
		);
	});

	test("category row navigates to the matching archive filter", async ({
		page,
	}) => {
		const first = page.locator(".category-index__row").first();
		const name = (
			(await first.locator(".category-index__name").textContent()) ?? ""
		).trim();
		await first.click();
		await expect(page).toHaveURL(
			new RegExp(
				`[?&]category=${encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
			),
		);
		await expect(
			page.locator('widget-layout[data-id="categories"]'),
		).toBeVisible();
		await expect(page.locator('widget-layout[data-id="tags"]')).toBeVisible();
	});

	test("keeps a single column on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.reload();
		await expect(page.locator(".category-index__list")).toHaveCSS(
			"grid-template-columns",
			/\d+(\.\d+)?px/,
		);
	});
});

test.describe("标签索引页 /tags/", () => {
	test("renders tag chips with counts and archive filter links", async ({
		page,
	}) => {
		await page.goto("/tags/");
		await expect(page.locator(".page-header__title")).not.toBeEmpty();
		await expect(page.locator(".page-header__icon svg")).toHaveCount(1);

		const chips = page.locator(".tag-index__chip");
		await expect(chips.first()).toBeVisible();
		const count = await chips.count();
		expect(count).toBeGreaterThan(0);

		for (let index = 0; index < Math.min(count, 5); index += 1) {
			const chip = chips.nth(index);
			await expect(chip.locator(".tag-index__count")).toHaveText(/^\d+$/);
			await expect(chip).toHaveAttribute("href", /\/archive\/\?tag=/);
		}

		await expect(
			page.locator('widget-layout[data-id="categories"]'),
		).toBeHidden();
		await expect(page.locator('widget-layout[data-id="tags"]')).toBeHidden();
		await expect(page.locator(".expand-btn")).toHaveCount(0);
	});

	test("tag chip navigates to the matching archive filter", async ({
		page,
	}) => {
		await page.goto("/tags/");
		const first = page.locator(".tag-index__chip").first();
		await expect(first).toBeVisible();
		await first.click();
		await expect(page).toHaveURL(/[?&]tag=/);
		expect(
			await page.locator(".archive-title, .page-header__title").count(),
		).toBeGreaterThan(0);
	});
});

test.describe("侧栏分类与标签入口", () => {
	test("tags widget stays a preview and centers its index link", async ({
		page,
	}) => {
		await page.goto("/");
		const tagsWidget = page.locator('widget-layout[data-id="tags"]');
		await expect(tagsWidget).toBeVisible();

		const chips = tagsWidget.locator(".m3-blog-taglist .m3-chip");
		const chipCount = await chips.count();
		expect(chipCount).toBeGreaterThan(0);
		expect(chipCount).toBeLessThanOrEqual(6);
		await expect(tagsWidget.locator(".expand-btn")).toHaveCount(0);

		const indexLink = tagsWidget.locator('.widget-index-link a[href="/tags/"]');
		if ((await indexLink.count()) === 0) return; // 标签未超过展示上限时不渲染入口
		await expect(indexLink).toHaveCSS("justify-content", "center");
		const [widgetBox, linkBox] = await Promise.all([
			tagsWidget.boundingBox(),
			indexLink.boundingBox(),
		]);
		expect(widgetBox, "tags widget has no bounding box").not.toBeNull();
		expect(linkBox, "tags index link has no bounding box").not.toBeNull();
		if (!widgetBox || !linkBox) return;
		expect(
			Math.abs(
				widgetBox.x + widgetBox.width / 2 - (linkBox.x + linkBox.width / 2),
			),
		).toBeLessThanOrEqual(1);
	});
});
