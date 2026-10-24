/**
 * 侧边栏布局配置（数据驱动编排）。
 *
 * 【核心概念】
 * 1. arrangement（侧栏编排模式）：
 *    - "single"（单栏，默认）：所有 widget 放入主侧栏，适合紧凑布局（页框 85rem）；
 *    - "dual"（双栏）：column: "secondary" 的 widget 放入副侧栏（视口 ≥ 1280px 展开三列，页框 96rem），
 *      在 1024px~1279px 之间会自动优雅退化为单栏，无需手动适配。
 * 2. side（主栏物理位置）：
 *    - "left"：主侧栏在左侧（默认），dual 模式下副栏自动落右侧；
 *    - "right"：主侧栏在右侧，dual 模式下副栏落左侧。
 * 3. widget 属性：
 *    - type：组件类型（"profile" | "music" | "announcement" | "categories" | "tags" | "series" | "stats" | "calendar" | "toc"）；
 *    - enable：是否启用该 widget；
 *    - slot："top"（固定在顶部）| "sticky"（页面滚动时吸顶跟随）；
 *    - column："primary"（主栏，默认）| "secondary"（副栏，仅在 arrangement: "dual" 时生效）；
 *    - pages：仅在指定页面展示（如 ["home", "post"]，省略时默认全页面展示）；
 *    - collapseAfter：折叠阈值（适用于 categories/tags/series，超出条数显示展开按钮）。
 *
 * 类型定义见 src/types/sidebarConfig.ts。
 */
import type { SidebarConfig, SidebarPage } from "@/types/sidebarConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 上下文 widget（分类 / 系列 / 标签）的默认展示页面：内容页 + 聚合入口页。
 * 三处 widget 共用同一份清单，新增页面标识符时只改这里一次；否则漏改其中
 * 一处就会让整块侧栏在新页面类型上消失（`series` 页面曾经就是这样：
 * `SidebarPage` 与页面 `page="series"` 都在，但三个 widget 的 pages 列表没跟上）。
 *
 * 刻意不含 `categories` / `tags` / `series` 三个索引页自身：索引页只保留统计卡，
 * 避免同一类入口在当前页面重复出现。
 */
const CONTENT_WIDGET_PAGES: SidebarPage[] = [
	"home",
	"archive",
	"friends",
	"moments",
	"anime",
	"compass",
	"skills",
	"projects",
	"devices",
	"games",
	"timeline",
	"albums",
	"about",
	"post",
	"series",
];

/** 统计卡只在聚合索引页出现（文章等内容页不显示） */
const STATS_WIDGET_PAGES: SidebarPage[] = [
	"home",
	"archive",
	"categories",
	"tags",
	"series",
];

export const sidebarConfig: SidebarConfig = withUserConfig("sidebar", {
	enable: true,
	arrangement: "dual",
	side: "left",
	components: [
		{ type: "profile", enable: true, slot: "top" },
		{ type: "music", enable: true, slot: "top" },
		{ type: "announcement", enable: true, slot: "top", pages: ["home"] },
		{
			type: "categories",
			enable: true,
			slot: "sticky",
			collapseAfter: 5,
			pages: CONTENT_WIDGET_PAGES,
		},
		{
			type: "series",
			enable: true,
			slot: "sticky",
			collapseAfter: 5,
			pages: CONTENT_WIDGET_PAGES,
		},
		{
			type: "tags",
			enable: true,
			slot: "sticky",
			collapseAfter: 6,
			pages: CONTENT_WIDGET_PAGES,
		},
		{
			type: "stats",
			enable: true,
			slot: "top",
			column: "secondary",
			pages: STATS_WIDGET_PAGES,
		},
		{ type: "calendar", enable: true, slot: "top", column: "secondary" },
		{
			type: "toc",
			enable: true,
			slot: "sticky",
			column: "secondary",
			pages: ["post"],
		},
	],
});
