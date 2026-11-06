import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { resolveImageAsset } from "./asset-utils";

export interface ResponsiveAvatarImage {
	src: string;
	srcset?: string;
	width?: number;
	height?: number;
}

interface ResponsiveAvatarOptions {
	/** 生成的候选宽度（只保留不超过原图的档位） */
	widths?: number[];
	/** 无 srcset 命中时回退的宽度；缺省取最大候选 */
	preferredWidth?: number;
	format?: "webp" | "avif" | "png" | "jpg";
	quality?: number;
}

/**
 * 把 profile 头像配置解析为可直接交给 Avatar 的响应式图片数据。
 * 公开路径 / 远程 URL 原样返回；本地资源在构建期生成 WebP 候选。
 */
export async function resolveResponsiveAvatar(
	avatar: string | undefined,
	options: ResponsiveAvatarOptions = {},
): Promise<ResponsiveAvatarImage> {
	const asset: ImageMetadata | string = await resolveImageAsset(avatar ?? "");
	if (typeof asset === "string") {
		return { src: asset };
	}

	const widths = (options.widths ?? [128, 256, 384, 512]).filter(
		(width) => width <= asset.width,
	);
	const candidates = await Promise.all(
		widths.map(async (width) => ({
			width,
			image: await getImage({
				src: asset,
				width,
				format: options.format ?? "webp",
				quality: options.quality ?? 72,
			}),
		})),
	);

	const preferred = candidates.find(
		({ width }) => width === options.preferredWidth,
	);

	return {
		src: preferred?.image.src ?? candidates.at(-1)?.image.src ?? asset.src,
		srcset: candidates.length
			? candidates
					.map(({ image, width }) => `${image.src} ${width}w`)
					.join(", ")
			: undefined,
		width: asset.width,
		height: asset.height,
	};
}
