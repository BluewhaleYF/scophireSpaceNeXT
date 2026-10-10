import type { AnnouncementConfig } from "@/types/announcementConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 公告栏配置
 * 组件显示由 sidebarConfig 统一控制
 */
export const announcementConfig: AnnouncementConfig = withUserConfig(
	"announcement",
	{
		title: "重构公告", // 公告标题，填空使用 i18n 字符串 Key.announcement
		content: "ScophireSapce 近期正在以重构的方式从 Mizuki 迁移到 Shirone 主题",
		link: {
			enable: false, // 启用链接
			text: "GitHub", // 链接文本
			url: "https://github.com", // 链接 URL
			external: true, // 外部链接
		},
	},
);
