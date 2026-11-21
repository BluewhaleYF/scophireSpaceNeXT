import { expect, test } from "@playwright/test";
import { siteMarkdownProcessor } from "../../src/utils/markdown-processor.mjs";

/**
 * Markdown 管线冒烟（内容无关版）。
 *
 * 上游合并最常动的就是 remark/rehype 插件链。这里用生产处理器渲染一段
 * fixture 源码，再挂到真实的 Markdown 页面上验证样式落地——不依赖 demo
 * 文章，也不往已发布内容里塞回归专用段落。
 *
 * 覆盖：admonition 容器、marker 高亮、缩写 tooltip、KaTeX、行内代码强调。
 */
const source = `
*[HTML]: HyperText Markup Language

:::note 冒烟提示
这是一段用于验证 Markdown 管线的提示内容。
:::

正文包含 ==高亮片段=={.secondary} 和一个术语 HTML。

$$
a^2 + b^2 = c^2
$$

行内代码强调 **\`const\`** 仍应保留粗体语义。
`;

test.describe("Markdown pipeline smoke", () => {
	for (const navigation of ["direct", "swup"] as const) {
		test(`renders admonition, marker, abbreviation, math and code emphasis (${navigation})`, async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: "reduce" });

			if (navigation === "direct") {
				await page.goto("/about/", { waitUntil: "domcontentloaded" });
			} else {
				await page.goto("/", { waitUntil: "domcontentloaded" });
				await page.waitForFunction(() => Boolean(window.swup?.navigate));
				await page.evaluate(() => window.swup?.navigate("/about/"));
				await expect(page).toHaveURL(/\/about\/?$/);
			}

			await page.waitForFunction(() =>
				getComputedStyle(document.documentElement)
					.getPropertyValue("--mc-primary")
					.trim()
					.startsWith("#"),
			);
			await page.locator(".custom-md").first().waitFor();

			const renderer = await siteMarkdownProcessor.createRenderer({});
			const result = await renderer.render(source);
			expect(result.code).toContain("m3-admonition");

			await page
				.locator(".custom-md")
				.first()
				.evaluate((root, html) => {
					const fixture = document.createElement("div");
					fixture.dataset.markdownFixture = "true";
					fixture.innerHTML = html;
					root.prepend(fixture);
				}, result.code);

			const fixture = page.locator("[data-markdown-fixture]");
			const admonition = fixture.locator(".m3-admonition");
			await expect(admonition).toHaveCount(1);
			await expect(admonition).toBeVisible();

			const marker = fixture.locator("mark.m3-marker");
			await expect(marker).toHaveCount(1);
			await expect(marker).toHaveAttribute("data-marker", "secondary");
			expect((await marker.boundingBox())?.width ?? 0).toBeGreaterThan(10);

			const abbreviation = fixture.locator("abbr.m3-abbreviation");
			await expect(abbreviation).toHaveCount(1);
			await expect(abbreviation).toHaveText("HTML");
			await expect(abbreviation).toHaveAttribute(
				"aria-label",
				/HTML: HyperText Markup Language/,
			);

			const math = fixture.locator(".katex");
			await expect(math).toHaveCount(1);

			const strongCode = fixture.locator("strong code");
			await expect(strongCode).toHaveText("const");
		});
	}
});
