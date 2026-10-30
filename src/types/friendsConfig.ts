import type { PageMeta } from "./pageMeta.ts";

/**
 * 友链申请卡片中的「本站信息」。
 * 这段内容会原样渲染成 YAML 代码块，供访客复制后回填到自己的友链数据里，
 * 因此字段与 `src/data/friends.ts` 的 FriendItem 保持一致（不含 id）。
 */
export interface FriendApplySiteInfo {
	/** 本站名称 */
	title: string;
	/** 本站头像 / 站点图标的绝对 URL（需公网可访问） */
	imgurl: string;
	/** 本站一句话简介 */
	desc: string;
	/** 本站地址（绝对 URL） */
	siteurl: string;
	/** 建议对方给本站添加的标签 */
	tags: string[];
}

/** 友链申请卡片：站点信息模板 + 复制 + mailto 申请入口 */
export interface FriendApplyConfig {
	/** 是否在友链列表下方展示申请卡片；false 时零 DOM、零客户端脚本 */
	enable: boolean;
	/** 收件邮箱；留空时只展示「复制本站信息」，不渲染 mailto 按钮 */
	email?: string;
	/** 申请模板中的本站信息；省略的字段回退到 siteConfig / profileConfig */
	siteInfo?: Partial<FriendApplySiteInfo>;
}

export interface FriendsConfig extends PageMeta {
	/** 友链申请卡片（默认开启） */
	apply?: FriendApplyConfig;
}
