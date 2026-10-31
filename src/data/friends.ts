/**
 * 友情链接数据配置（结构与 Mizuki 同款，便于互相迁移）。
 * 用于管理友情链接页面的数据：src/pages/friends.astro → organisms/FriendSection。
 *
 * 添加友链：在 friendsData 中追加一项即可，页面 / 筛选标签自动生成。
 * tags 会聚合为页面顶部的筛选 chip（OR 命中：选中多个标签时命中任一即显示）。
 * 列表下方的「申请友链」卡片（本站信息模板 / 收件邮箱 / 开关）由
 * src/config/friendsConfig.ts 的 apply 配置控制。
 *
 * imgurl 支持三种写法（与 games.ts 一致）：
 * - src/assets 相对路径（如本文件所用，构建期由 Astro 输出带哈希的静态地址）；
 * - /public 绝对路径（如 "/images/friends/x.webp"，原样输出）；
 * - 远程 URL（https://…，原样输出）。
 * 本地头像统一存放在 src/assets/friends/，192×192 WebP，显示尺寸 40px（4x 余量）。
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
		imgurl: "assets/friends/goatshed.webp",
		desc: "while (活着) { 吃饭(); 上学(); 编程(); 睡觉(); }",
		siteurl: "https://littlesheep.me/",
		tags: ["Friend", "Blog"],
	},
	{
		id: 2,
		title: "Chaos的小站",
		imgurl: "assets/friends/chaos.webp",
		desc: "调制饮料，改变人生。正在尝试写点有用的",
		siteurl: "https://www.nachaos.xyz/",
		tags: ["Friend", "Blog"],
	},
	{
		id: 3,
		title: "涵哲子居",
		imgurl: "assets/friends/iluc.webp",
		desc: "天哲地理，共公卿好",
		siteurl: "https://iluc.cn",
		tags: ["Friend", "Blog"],
	},
	{
		id: 4,
		title: "Texas0295's Blog",
		imgurl: "assets/friends/texas0295.webp",
		desc: "人生は意味無し",
		siteurl: "https://texas0295.top/",
		tags: ["Friend", "Blog"],
	},
	{
		id: 5,
		title: "MKY-AN20's Home",
		imgurl: "assets/friends/mky-an20.webp",
		desc: "MKY-AN20的主页",
		siteurl: "https://3w.mky-an20.os.kg/",
		tags: ["Friend"],
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
