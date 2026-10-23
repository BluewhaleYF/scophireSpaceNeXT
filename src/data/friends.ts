/**
 * 友情链接数据配置（结构与 Mizuki 同款，便于互相迁移）。
 * 用于管理友情链接页面的数据：src/pages/friends.astro → organisms/FriendSection。
 *
 * 添加友链：在 friendsData 中追加一项即可，页面 / 筛选标签自动生成。
 * tags 会聚合为页面顶部的筛选 chip（OR 命中：选中多个标签时命中任一即显示）。
 */
export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "GoatShed",
		imgurl:
			"https://raw.githubusercontent.com/BluewhaleYF/ScophireSpace-Files/refs/heads/main/Friends/Goatshed.webp",
		desc: "while (活着) { 吃饭(); 上学(); 编程(); 睡觉(); }",
		siteurl: "https://littlesheep.me/",
		tags: ["Blog"],
	},
	{
		id: 2,
		title: "Texas0295's Blog",
		imgurl:
			"https://github.com/BluewhaleYF/ScophireSpace-Files/blob/main/Friends/texas0295.jpg?raw=true",
		desc: "人生は意味無し",
		siteurl: "https://texas0295.top/",
		tags: ["Blog"],
	},
	{
		id: 3,
		title: "MKY-AN20's Home",
		imgurl:
			"https://github.com/BluewhaleYF/ScophireSpace-Files/blob/main/Friends/mky.png?raw=true",
		desc: "MKY-AN20的主页",
		siteurl: "https://3w.mky-an20.os.kg/",
		tags: ["Blog"],
	},
];

// 获取所有友情链接数据（稳定顺序，测试可复现）
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据（避免固定排序，按需使用）
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
