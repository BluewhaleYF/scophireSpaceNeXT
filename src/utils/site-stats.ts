/**
 * 站点统计取数（SideBar stats widget 消费）。
 * 模块级备忘化：构建期多个页面渲染共享一次汇总（总字数需要对全部
 * 文章跑 render 提取 remark 字数，不做缓存会逐页重复开销）。
 */
import { render } from "astro:content";
import { seriesConfig } from "../config/seriesConfig.ts";
import { siteConfig } from "../config/siteConfig.ts";
import {
	getCategoryList,
	getSeriesCatalog,
	getSortedMoments,
	getSortedPosts,
	getTagList,
} from "./content-utils";

export interface SiteStats {
	posts: number;
	moments: number;
	categories: number;
	tags: number;
	/** 系列实体数 */
	series: number;
	/** 全部文章 remark 字数之和 */
	words: number;
	/**
	 * 运行天数：以 `siteConfig.startDate` 为起点；未配置或日期无效时
	 * 回退为最早一篇文章的发布日（无文章则 0）
	 */
	days: number;
	/** 最近更新：全站最新一篇的发布/更新日（ISO 字符串；无文章为 null） */
	lastActivity: string | null;
}

const DAY_MS = 86_400_000;

let cache: SiteStats | null = null;

export async function getSiteStats(): Promise<SiteStats> {
	if (cache) return cache;

	const [posts, moments, categories, tags, seriesCatalog] = await Promise.all([
		getSortedPosts(),
		getSortedMoments(),
		getCategoryList(),
		getTagList(),
		// 功能关闭时不查集合（SiteStats 也不产出系列行）
		seriesConfig.enable ? getSeriesCatalog() : Promise.resolve(null),
	]);

	// 总字数、最早发布日与最近更新日来自同一批文章，一次遍历
	let words = 0;
	let earliest = Number.POSITIVE_INFINITY;
	let latestActivity = 0;
	for (const post of posts) {
		const { remarkPluginFrontmatter } = await render(post);
		words += remarkPluginFrontmatter.words ?? 0;
		const published = new Date(post.data.published).getTime();
		if (published < earliest) earliest = published;
		const updated = post.data.updated
			? new Date(post.data.updated).getTime()
			: 0;
		latestActivity = Math.max(latestActivity, published, updated);
	}

	// 运行天数优先取站点配置的开始日期；无效时回退到最早文章发布日期
	const configuredStart = siteConfig.startDate
		? Date.parse(siteConfig.startDate)
		: Number.NaN;
	const runningStart = Number.isFinite(configuredStart)
		? configuredStart
		: earliest;

	cache = {
		posts: posts.length,
		moments: moments.length,
		categories: categories.length,
		tags: tags.length,
		/** 系列实体数（功能关闭时为 0，SiteStats 不产出该行） */
		series: seriesCatalog?.size ?? 0,
		words,
		days: Number.isFinite(runningStart)
			? Math.max(0, Math.floor((Date.now() - runningStart) / DAY_MS))
			: 0,
		lastActivity:
			latestActivity > 0 ? new Date(latestActivity).toISOString() : null,
	};
	return cache;
}
