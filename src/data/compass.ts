/**
 * 站点罗盘数据（本地数据源）。
 * 用途：src/pages/compass.astro → organisms/CompassSection → molecules/CompassTile。
 * 添加站点：往对应 Shelf.entries 追加一项；数组顺序即展示顺序。
 * - icon：Iconify 名（material-symbols:xxx）或图片 URL（http(s)/绝对路径）；
 *   省略时瓷砖显示 label 首字母 tonal 块（不自动抓取 favicon）。
 * - image：用户自定义图片，支持 src/assets 相对路径（如本文件所用）、/public
 *   绝对路径与远程 URL；优先于 icon 渲染，加载失败自动降级为首字母块。
 *   本地图标统一存放在 src/assets/compass/，128×128 WebP（瓷砖内显示 32px）。
 */

/** 单条站点记录 */
export interface CompassEntry {
	/** 站点名（瓷砖标题） */
	label: string;
	/** 外链地址 */
	href: string;
	/** 一句话说明（瓷砖副行；省略则显示域名） */
	note?: string;
	/** 图标：Iconify 名或图片 URL；省略 = 首字母兜底 */
	icon?: string;
	/** 用户自定义图片（src/assets 相对路径 / /public / http(s)）：优先于 icon 渲染；省略则走 icon/首字母 */
	image?: string;
}

/** 分组（Shelf = 罗盘上的收纳格） */
export interface CompassShelf {
	/** 锚点 id（字母数字，作分组定位与跳转） */
	key: string;
	/** 分组名 */
	name: string;
	/** 分组图标（Iconify 名，SectionTitle 行首） */
	icon?: string;
	/** 分组副文案（标题下弱文本，可选） */
	blurb?: string;
	entries: CompassEntry[];
}

export const compassData: CompassShelf[] = [
	{
		key: "friend-sites",
		name: "友站",
		icon: "material-symbols:group-outline-rounded",
		entries: [
			{
				label: "Solsynth",
				href: "https://solsynth.dev/",
				note: "来自太阳系，向着全宇宙。",
				image: "assets/compass/solsynth.webp",
			},
			{
				label: "羝 ICP 备案",
				href: "https://solsynth.dev/zh/products/roy-filling",
				note: "经中华羊国网络信息办公室授权的认证网站目录",
				image: "assets/compass/roy-icp.webp",
			},
		],
	},
	{
		key: "community",
		name: "社区",
		icon: "material-symbols:forum-outline-rounded",
		entries: [
			{
				label: "Solian",
				href: "https://web.solian.app/",
				note: "一个宁静的社交网络，让表达自我、结识他人变得简单",
				image: "assets/compass/solian.webp",
			},
			{
				label: "StyleStar",
				href: "https://stylestar.win/",
				note: "现代拟物化中文论坛",
				image: "assets/compass/stylestar.webp",
			},
		],
	},
	{
		key: "frequent",
		name: "常去",
		icon: "material-symbols:bookmark-outline-rounded",
		entries: [
			{
				label: "GitHub",
				href: "https://github.com/",
				note: "Change is constant",
				image: "assets/compass/github.webp",
			},
			{
				label: "Wayback Machine",
				href: "https://web.archive.org/",
				note: "互联网的时光机，替消失的网页留一盏灯。",
				image: "assets/compass/wayback-machine.webp",
			},
		],
	},
];
