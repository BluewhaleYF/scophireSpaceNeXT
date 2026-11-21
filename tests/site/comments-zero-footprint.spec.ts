import { expect, test } from "@playwright/test";
import {
	commentConfig,
	resolveCommentOptions,
} from "../../src/config/commentConfig";

/**
 * 「零额外负担」的评论契约（内容无关版）。
 *
 * 站点的评论默认关闭；关闭时不得输出评论容器、第三方脚本/样式，也不得发起
 * 任何 provider 请求。这里用首页 + 首页发现的一篇文章覆盖两种入口，不绑定
 * 上游 demo 的 `/posts/guide/`。Provider 一旦启用，文章页断言自动跳过。
 *
 * 定义见规则：可选功能关闭时零外部请求、零 DOM 足迹、零布局位移。
 */
const options = resolveCommentOptions(commentConfig);

const PROVIDER_URL_MARKERS = [
	"@waline/",
	"cdn.jsdelivr.net/npm/@waline",
	"unpkg.com/@waline",
	"giscus.app/client.js",
	"twikoo",
];

const COMMENT_WRAPPERS = "shirone-waline, shirone-twikoo, shirone-giscus";

const trackProviderRequests = (page: import("@playwright/test").Page) => {
	const requests: string[] = [];
	page.on("request", (request) => {
		const url = request.url();
		if (PROVIDER_URL_MARKERS.some((marker) => url.includes(marker))) {
			requests.push(url);
		}
	});
	return requests;
};

const discoverFirstPost = async (
	page: import("@playwright/test").Page,
): Promise<string> => {
	await page.goto("/", { waitUntil: "domcontentloaded" });
	const href = await page
		.locator("#post-list .m3-blog-postcard__title")
		.first()
		.getAttribute("href");
	if (!href) throw new Error("首页没有找到任何文章链接");
	return href;
};

test.describe("comments disabled leave no footprint", () => {
	test("home page has no comment DOM, styles or provider requests", async ({
		page,
	}) => {
		const requests = trackProviderRequests(page);
		await page.goto("/");
		await expect(page.locator(COMMENT_WRAPPERS)).toHaveCount(0);
		await expect(page.locator("[data-waline-style]")).toHaveCount(0);
		await expect(page.locator("#comments")).toHaveCount(0);
		expect(requests).toEqual([]);
	});

	test("an article without comments stays clean on direct load and Swup", async ({
		page,
	}) => {
		test.skip(
			options !== null,
			"comments are enabled in this site config; the zero-footprint case no longer applies",
		);
		const requests = trackProviderRequests(page);
		const postPath = await discoverFirstPost(page);

		await page.goto(postPath, { waitUntil: "domcontentloaded" });
		await expect(page.locator(COMMENT_WRAPPERS)).toHaveCount(0);
		await expect(page.locator("#comments")).toHaveCount(0);

		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.waitForFunction(() => Boolean(window.swup?.navigate));
		await page.evaluate((path) => window.swup?.navigate(path), postPath);
		await expect(page).toHaveURL(
			new RegExp(`${postPath.replace(/\/$/, "")}/?$`),
		);
		await expect(page.locator(COMMENT_WRAPPERS)).toHaveCount(0);
		await expect(page.locator("#comments")).toHaveCount(0);
		expect(requests).toEqual([]);
	});
});
