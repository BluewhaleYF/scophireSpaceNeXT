import { expect, test } from "@playwright/test";
import { aboutConfig } from "../../src/config/aboutConfig";
import { albumsConfig } from "../../src/config/albumsConfig";
import { animeConfig } from "../../src/config/animeConfig";
import { compassConfig } from "../../src/config/compassConfig";
import { devicesConfig } from "../../src/config/devicesConfig";
import { friendsConfig } from "../../src/config/friendsConfig";
import { momentsConfig } from "../../src/config/momentsConfig";
import { projectsConfig } from "../../src/config/projectsConfig";
import { siteConfig } from "../../src/config/siteConfig";
import { skillsConfig } from "../../src/config/skillsConfig";
import { timelineConfig } from "../../src/config/timelineConfig";

/**
 * 功能开关 → 对应导航路由（与 `src/config/navBarConfig.ts` 的裁剪表同源）。
 * 关闭的功能页面会重定向 `/404/`，导航入口必须一并消失，因此这里按开关断言。
 */
const featureRoutes: Array<[string, boolean, string]> = [
	["friends", friendsConfig.enable, "/friends/"],
	["moments", momentsConfig.enable, "/moments/"],
	["anime", animeConfig.enable, "/anime/"],
	["compass", compassConfig.enable, "/compass/"],
	["albums", albumsConfig.enable, "/albums/"],
	["timeline", timelineConfig.enable, "/timeline/"],
	["projects", projectsConfig.enable, "/projects/"],
	["devices", devicesConfig.enable, "/devices/"],
	["skills", skillsConfig.enable, "/skills/"],
	["about", aboutConfig.enable, "/about/"],
];

test.describe("top app bar content", () => {
	test("shows the configured site title and a visible navigation", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });

		const content = page.locator("#navbar > div").first();
		// 标题文案由站点配置决定，避免绑定上游 demo 的 "Shirone"。
		await expect(content.locator(":scope > a")).toHaveText(siteConfig.title);
		await expect(content.locator(":scope > nav")).toBeVisible();
	});
});

test.describe("navigation feature gating", () => {
	test("lists exactly the enabled feature pages in the top bar", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });

		for (const [feature, enabled, href] of featureRoutes) {
			await expect(
				page.locator(`#navbar nav a[href="${href}"]`),
				`top bar entry for ${feature}`,
			).toHaveCount(enabled ? 1 : 0);
		}
	});

	test("keeps the mobile drawer free of dead feature links", async ({
		page,
	}) => {
		// 抽屉只在窄屏出现（`lg:!hidden`），分组子项展开后才进入 DOM。
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.locator("#nav-drawer-switch").click();

		const groupHeads = page.locator(".site-drawer__group-head");
		for (let index = 0; index < (await groupHeads.count()); index += 1) {
			await groupHeads.nth(index).click();
		}

		for (const [feature, enabled, href] of featureRoutes) {
			await expect(
				page.locator(`.site-drawer a[href="${href}"]`),
				`drawer entry for ${feature}`,
			).toHaveCount(enabled ? 1 : 0);
		}
	});
});
