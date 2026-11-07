import { expect, test } from "@playwright/test";

/**
 * SegmentedButton 单选高亮块：位置跟随选中项，并以 transform 动画平滑移动。
 * 只依赖归档页分组切换的结构，不断言文章数据或本地化文案。
 */
test.describe("SegmentedButton 高亮块", () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	test("高亮块与选中段对齐并在切换后平滑移动", async ({ page }) => {
		await page.goto("/archive/", { waitUntil: "networkidle" });

		const group = page.locator(".archive-panel .m3-segmented");
		const segments = group.locator(".m3-segmented__segment");
		const indicator = group.locator(".m3-segmented__indicator");

		await expect(segments).toHaveCount(3);
		await expect(indicator).toHaveCount(1);
		await expect(group.locator(".m3-segmented__check")).toHaveCount(0);
		await expect(indicator).toHaveCSS(
			"transition-property",
			"transform, width",
		);

		const initialSegment = await segments.nth(0).boundingBox();
		const initialIndicator = await indicator.boundingBox();
		if (!initialSegment || !initialIndicator) {
			throw new Error("高亮块或选中段未渲染");
		}
		expect(initialIndicator.x).toBeCloseTo(initialSegment.x, 0);
		expect(initialIndicator.width).toBeCloseTo(initialSegment.width, 0);

		await segments.nth(2).click();
		await page.waitForTimeout(400);

		const targetSegment = await segments.nth(2).boundingBox();
		const finalIndicator = await indicator.boundingBox();
		if (!targetSegment || !finalIndicator) {
			throw new Error("高亮块或目标段未渲染");
		}
		expect(finalIndicator.x).toBeCloseTo(targetSegment.x, 0);
		expect(finalIndicator.width).toBeCloseTo(targetSegment.width, 0);
	});
});
