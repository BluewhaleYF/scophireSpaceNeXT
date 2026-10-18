/**
 * 游戏展示页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/gamesConfig.ts 控制。
 *
 * 封面支持三种写法：
 * - src/assets 相对路径（如本文件所用，走 Astro 图片管线自动优化为 webp/avif）；
 * - /public 绝对路径（如 "/assets/games/xxx.webp"，原样输出）；
 * - 远程 URL（https://…）。
 *
 * 注：以下为演示条目——评分 / 时长 / 状态是占位数值，请按自己的实际情况调整；
 * 封面取自各游戏官方商店页或官网主视觉。
 */
import type { GameItem } from "@/types/gamesConfig";

export const gamesData: GameItem[] = [
	{
		id: "minecraft",
		name: "Minecraft",
		developer: "Mojang Studios",
		category: "sandbox",
		status: "playing",
		cover: "assets/games/minecraft-hero.jpg",
		icon: "material-symbols:widgets-rounded",
		rating: 5,
		hours: 1500,
		platform: "iOS / Android / PC / Mac",
		year: "2009",
		tags: ["沙盒"],
		description: "方块之间，无限可能",
		link: "https://www.minecraft.net/",
		featured: true,
	},
	{
		id: "bluearchive",
		name: "Blue Archive",
		developer: "Nexon",
		category: "rpg",
		status: "playing",
		cover: "assets/games/blue-archive.jpg",
		icon: "material-symbols:widgets-rounded",
		rating: 4.0,
		hours: 30,
		platform: "iOS / Android / PC",
		year: "2021",
		tags: ["RPG", "二次元"],
		description: "一切奇迹的起点",
		link: "https://www.bluearchive.jp/",
	},
	{
		id: "noexistencen-of-you-and-me",
		name: "不/存在的你，和我",
		developer: "Fontainebleau",
		category: "adventure",
		status: "playing",
		cover: "assets/games/nonand.png",
		icon: "material-symbols:menu-book-rounded",
		rating: 5.0,
		hours: 10,
		platform: "PC / iOS",
		year: "2024",
		tags: ["视觉小说", "Meta"],
		description:
			'Explore the truth of "you/girl/world" through the form of a "visual novel".',
		link: "https://store.steampowered.com/app/2873080/",
		featured: true,
	},
	{
		id: "astrae-oratio",
		name: "阿索拉：星之祈愿",
		developer: "Dynamis One",
		category: "rpg",
		status: "wishlist",
		cover: "assets/games/astrae-oratio-hero.webp",
		icon: "material-symbols:auto-awesome-rounded",
		rating: 0,
		hours: 0,
		platform: "iOS / PC",
		year: "2027",
		tags: ["RPG", "二次元"],
		description: "——1889年東京，全新的夢「魔法」開始了。",
		link: "https://astraeoratio.plaync.com/zh-tw/index",
	},
	{
		id: "hoi4",
		name: "Hearts of Iron IV",
		developer: "Paradox Interactive",
		category: "strategy",
		status: "paused",
		cover: "assets/games/hoi4.webp",
		icon: "material-symbols:widgets-rounded",
		rating: 4.5,
		hours: 415,
		platform: "PC",
		year: "2020",
		tags: ["策略"],
		description: "Victory is at your fingertips!",
		link: "https://www.paradoxinteractive.com/games/hearts-of-iron-iv/about",
	},
	{
		id: "gyakuten-saiban",
		name: "逆転裁判123 成歩堂セレクション",
		developer: "Capcom",
		category: "adventure",
		status: "paused",
		cover: "assets/games/gyakuten-saiban.jpg",
		icon: "material-symbols:widgets-rounded",
		rating: 4.5,
		hours: 10,
		platform: "PC",
		year: "2014",
		tags: ["AVG", "推理", "法庭"],
		description: "真実は一つ！証言の矛盾を暴き、依頼人の無実を証明しろ！",
		link: "https://www.ace-attorney.com/trilogy/ja/",
	},
];
