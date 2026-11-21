import { expect, type Page, test } from "@playwright/test";

/**
 * 文章页回归（内容无关版）。
 *
 * 路径从首页发现，而不是绑定某个固定 slug——个人站的文章会增删，主题的
 * 文章页契约（Markdown 容器、标题节奏、分享、OG 元数据）不应跟着内容变化。
 * 覆盖直接加载与 Swup 客户端导航两条路径。
 */
test.describe("Site post", () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	const discoverFirstPost = async (page: Page): Promise<string> => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		const href = await page
			.locator("#post-list .m3-blog-postcard__title")
			.first()
			.getAttribute("href");
		if (!href) throw new Error("首页没有找到任何文章链接");
		return href;
	};

	const waitForPageReady = async (page: Page) => {
		await page.waitForFunction(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue("--mc-primary")
				.trim()
				.startsWith("#"),
		);
		await page.waitForFunction(() =>
			[...document.querySelectorAll(".onload-animation")].every((element) => {
				if ((element as HTMLElement).offsetParent === null) return true;
				return getComputedStyle(element).opacity === "1";
			}),
		);
	};

	/** 标题节奏走 Markdown 的 utilities 桥接：首标题贴顶，其余用 --m3e-space-4。 */
	const readHeadingRhythm = (page: Page) =>
		page
			.locator(".markdown-content")
			.first()
			.evaluate((root) => {
				const rootStyles = getComputedStyle(document.documentElement);
				const headings = [
					...root.querySelectorAll<HTMLElement>("h2, h3"),
				].slice(0, 6);
				return {
					sectionSpace: rootStyles.getPropertyValue("--m3e-space-4").trim(),
					compactSpace: rootStyles.getPropertyValue("--m3e-space-2").trim(),
					headings: headings.map((heading) => {
						const computed = getComputedStyle(heading);
						return {
							marginTop: computed.marginTop,
							marginBottom: computed.marginBottom,
							firstChild: root.firstElementChild === heading,
						};
					}),
				};
			});

	test("direct load renders Markdown content with tokenized heading rhythm", async ({
		page,
	}) => {
		const postPath = await discoverFirstPost(page);
		await page.goto(postPath, { waitUntil: "domcontentloaded" });
		await waitForPageReady(page);

		await expect(page.locator(".markdown-content").first()).toBeVisible();
		const rhythm = await readHeadingRhythm(page);
		expect(rhythm.headings.length).toBeGreaterThan(0);
		for (const heading of rhythm.headings) {
			expect(heading.marginBottom).toBe(rhythm.compactSpace);
			expect(heading.marginTop).toBe(
				heading.firstChild ? "0px" : rhythm.sectionSpace,
			);
		}
	});

	test("Swup navigation keeps the article and its heading rhythm", async ({
		page,
	}) => {
		const postPath = await discoverFirstPost(page);
		await page.waitForFunction(() => Boolean(window.swup?.navigate));
		await page.evaluate((path) => window.swup?.navigate(path), postPath);

		await expect(page).toHaveURL(
			new RegExp(`${postPath.replace(/\/$/, "")}/?$`),
		);
		await waitForPageReady(page);
		await expect(page.locator(".markdown-content").first()).toBeVisible();

		const rhythm = await readHeadingRhythm(page);
		for (const heading of rhythm.headings) {
			expect(heading.marginBottom).toBe(rhythm.compactSpace);
		}
	});

	test("copy link writes the current post URL and shows a snackbar", async ({
		page,
		context,
	}) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"], {
			origin: "http://localhost:4321",
		});
		const postPath = await discoverFirstPost(page);
		await page.goto(postPath, { waitUntil: "networkidle" });
		await page.waitForTimeout(600);

		const copyButton = page.locator("#copy-post-link");
		await expect(copyButton).toHaveCount(1);
		await copyButton.click();
		await page.waitForTimeout(400);

		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toBe(page.url());

		const snackbar = page.locator(".m3-snackbar");
		await expect(snackbar).toHaveClass(/visible/);
		await expect(page.locator(".m3-snackbar__message")).not.toBeEmpty();
	});

	test("post metadata exposes a matching og:image and twitter:image", async ({
		page,
	}) => {
		const postPath = await discoverFirstPost(page);
		await page.goto(postPath, { waitUntil: "domcontentloaded" });

		const ogImage = page.locator('meta[property="og:image"]');
		await expect(ogImage).toHaveCount(1);
		const ogImageUrl = await ogImage.getAttribute("content");
		expect(ogImageUrl).toBeTruthy();

		const twitterImage = page.locator('meta[name="twitter:image"]');
		await expect(twitterImage).toHaveCount(1);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
			"content",
			"summary_large_image",
		);
		expect(await twitterImage.getAttribute("content")).toBe(ogImageUrl);
	});
});
