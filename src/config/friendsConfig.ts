import type { FriendsConfig } from "../types/friendsConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 友链页配置：页面标题 / 副标题，以及列表下方的「申请友链」卡片。
 * 类型见 src/types/friendsConfig.ts。
 */
export const friendsConfig: FriendsConfig = withUserConfig("friends", {
	enable: true,
	title: "$t:friends",
	description: "$t:friendsBanner",
	// 列表下方的申请卡片：本站信息模板 + 一键复制 + mailto 申请入口。
	// 关闭（enable: false）时不输出 DOM，也不加载复制逻辑。
	apply: {
		enable: true,
		// 收件邮箱；留空则只展示「复制本站信息」，不渲染邮件按钮。
		email: "scophire@proton.me",
		siteInfo: {
			// title / desc / siteurl 省略时回退到 siteConfig.title / subtitle / site。
			// imgurl 需为公网可访问的绝对地址；省略时回退到站点 logo。
			imgurl: "https://scophire.space/logo/icon.png",
			// 建议对方给本站添加的标签，会写进复制出的申请模板。
			tags: ["Friend", "Blog"],
		},
	},
});
