import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * 相册目录属于站点内容数据，可以只保留其中一部分。用例按目录是否存在决定
 * 是否执行，避免删掉示例相册后把整套回归变成 404 失败。
 */
const ALBUMS_DIR = new URL("../../public/images/albums/", import.meta.url);
const albumExists = (id: string) =>
	existsSync(new URL(`${id}/info.json`, ALBUMS_DIR));

test.describe("相册页响应式滚动", () => {
	// 滚动回归需要「本地多图相册」：masonry 布局给图片设了 aspect-ratio: auto，
	// 高度随图片加载到位；外部图源在慢网络下会先保持 0 高，不适合做滚动基线。
	const LOCAL_ALBUM = "AcgExample";

	test("从手机视口切换到桌面视口后仍可滚动", async ({ page }) => {
		test.skip(!albumExists(LOCAL_ALBUM), `站点未包含 albums/${LOCAL_ALBUM}`);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(`/albums/${LOCAL_ALBUM}/`, { waitUntil: "networkidle" });
		await expect(page.locator(".album-gallery__item").first()).toBeVisible();

		await page.setViewportSize({ width: 1440, height: 900 });
		await expect
			.poll(() =>
				page.evaluate(
					() => document.documentElement.scrollHeight > window.innerHeight,
				),
			)
			.toBe(true);

		await page.evaluate(() => window.scrollTo(0, 700));
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(0);

		await expect(page.locator("html")).not.toHaveAttribute(
			"data-overlayscrollbars",
		);
		await expect(page.locator("body")).not.toHaveAttribute(
			"data-overlayscrollbars",
		);
	});
});

test.describe("外部图源相册", () => {
	test("索引与详情按 info.json 渲染", async ({ page }) => {
		test.skip(
			!albumExists("ExternalExample"),
			"站点未包含 albums/ExternalExample",
		);

		await page.goto("/albums/", { waitUntil: "domcontentloaded" });
		await expect(
			page.locator('a[href="/albums/ExternalExample/"]').first(),
		).toBeVisible();

		await page.goto("/albums/ExternalExample/", {
			waitUntil: "domcontentloaded",
		});
		// 外部照片立即以 DOM 形式就位（高度等远程图片加载后再撑开）
		await expect(page.locator(".album-gallery__item")).toHaveCount(2);
		await expect(page.locator(".album-gallery")).toHaveClass(
			/album-gallery--masonry/,
		);
		await expect(page.locator(".album-gallery__item").first()).toHaveAttribute(
			"aria-label",
			/A remote (portrait|landscape) photograph/,
		);
	});
});

test.describe("受保护相册", () => {
	test("提供完整的密码输入与解锁反馈", async ({ page }) => {
		test.skip(!albumExists("EncryptedExample"), "站点未包含受保护相册示例");

		await page.goto("/albums/EncryptedExample/", {
			waitUntil: "domcontentloaded",
		});

		const input = page.getByRole("textbox", { name: "Password" });
		const submit = page.getByRole("button", { name: "Unlock album" });
		const visibility = page.getByRole("button", { name: "Show password" });

		await expect(
			page.getByRole("heading", { name: "This album is protected" }),
		).toBeVisible();
		await expect(page.getByText("Six digits", { exact: true })).toBeVisible();
		await expect(input).toHaveAttribute("type", "password");
		await expect(input).toHaveAttribute("autocomplete", "current-password");

		await visibility.click();
		await expect(input).toHaveAttribute("type", "text");
		await expect(
			page.getByRole("button", { name: "Hide password" }),
		).toBeVisible();

		await submit.click();
		await expect(
			page.getByText("Enter a password", { exact: true }),
		).toBeVisible();
		await expect(input).toHaveAttribute("aria-invalid", "true");

		await input.fill("000000");
		await expect(
			page.getByText("Enter a password", { exact: true }),
		).toBeHidden();
		await submit.click();
		await expect(
			page.getByText("That password could not unlock this album", {
				exact: true,
			}),
		).toBeVisible();

		await input.fill("123456");
		await submit.click();
		await expect(page.locator(".album-gallery__item")).toHaveCount(2);
		await expect(page.locator(".album-gallery")).toHaveClass(
			/album-gallery--masonry/,
		);
		await expect(page.locator(".album-gallery")).not.toHaveClass(
			/album-gallery--grid/,
		);
		const portrait = page.getByAltText("A protected vertical photograph");
		const landscape = page.getByAltText("A protected garden landscape");
		await expect(
			page.locator(".album-gallery__item img").first(),
		).toHaveAttribute("alt", "A protected vertical photograph");
		await expect
			.poll(async () => {
				const portraitBox = await portrait.boundingBox();
				const landscapeBox = await landscape.boundingBox();
				if (!portraitBox || !landscapeBox) return false;
				const naturalDirections = await page.evaluate(() => {
					const portraitImage = document.querySelector(
						'img[alt="A protected vertical photograph"]',
					) as HTMLImageElement | null;
					const landscapeImage = document.querySelector(
						'img[alt="A protected garden landscape"]',
					) as HTMLImageElement | null;
					return Boolean(
						portraitImage &&
							landscapeImage &&
							portraitImage.naturalHeight > portraitImage.naturalWidth &&
							landscapeImage.naturalWidth > landscapeImage.naturalHeight,
					);
				});
				return (
					naturalDirections &&
					portraitBox.height > portraitBox.width &&
					landscapeBox.width > landscapeBox.height &&
					portraitBox.x <= landscapeBox.x
				);
			})
			.toBe(true);
		await expect(page.locator(".password-gate")).toBeHidden();
		await expect
			.poll(() =>
				page.locator(".album-detail__gallery").evaluate((element) => {
					const style = getComputedStyle(element);
					return (
						style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
						style.padding !== "0px"
					);
				}),
			)
			.toBe(true);
	});
});
