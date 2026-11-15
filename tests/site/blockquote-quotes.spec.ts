import { expect, test } from "@playwright/test";

const MARKDOWN_PATH = "/about/";

/**
 * Blockquotes must not get Tailwind Typography's decorative quotation marks.
 *
 * Typography emits `content: open-quote` / `close-quote` for the first and
 * last paragraph of a blockquote in the `utilities` layer. Shirone marks the
 * quote with a primary accent bar instead, so those quotes are stray
 * punctuation. The components layer cannot win against utilities regardless of
 * specificity, so the bridge in `markdown-typography.css` must cancel them.
 *
 * A single-paragraph quote needs both pseudo-elements removed; a multi-
 * paragraph quote only gets them on its first/last paragraph.
 */
for (const navigation of ["direct", "swup"] as const) {
	test(`blockquotes omit typography quotation marks (${navigation})`, async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });

		if (navigation === "direct") {
			await page.goto(MARKDOWN_PATH, { waitUntil: "load" });
		} else {
			await page.goto("/");
			await page.waitForFunction(() => Boolean(window.swup));
			await page.evaluate((path) => {
				window.swup?.navigate(path);
			}, MARKDOWN_PATH);
			await expect(page).toHaveURL(new RegExp(`${MARKDOWN_PATH}$`));
		}

		await page.waitForFunction(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue("--mc-primary")
				.trim()
				.startsWith("#"),
		);
		await page.locator(".markdown-content").waitFor();

		const styles = await page.evaluate(() => {
			const host = document.querySelector(".markdown-content");
			if (!(host instanceof HTMLElement)) {
				throw new Error("missing .markdown-content");
			}

			host.insertAdjacentHTML(
				"beforeend",
				`
				<blockquote id="blockquote-single">
					<p id="blockquote-single-p">single paragraph</p>
				</blockquote>
				<blockquote id="blockquote-multi">
					<p id="blockquote-multi-first">first paragraph</p>
					<p id="blockquote-multi-middle">middle paragraph</p>
					<p id="blockquote-multi-last">last paragraph</p>
				</blockquote>
				`,
			);

			const content = (id: string, pseudo: "::before" | "::after") => {
				const element = document.getElementById(id);
				if (!element) throw new Error(`missing #${id}`);
				return getComputedStyle(element, pseudo).content;
			};

			return {
				singleBefore: content("blockquote-single-p", "::before"),
				singleAfter: content("blockquote-single-p", "::after"),
				multiFirstBefore: content("blockquote-multi-first", "::before"),
				multiMiddleBefore: content("blockquote-multi-middle", "::before"),
				multiMiddleAfter: content("blockquote-multi-middle", "::after"),
				multiLastAfter: content("blockquote-multi-last", "::after"),
			};
		});

		expect(styles.singleBefore).toBe("none");
		expect(styles.singleAfter).toBe("none");
		expect(styles.multiFirstBefore).toBe("none");
		expect(styles.multiMiddleBefore).toBe("none");
		expect(styles.multiMiddleAfter).toBe("none");
		expect(styles.multiLastAfter).toBe("none");
	});
}
