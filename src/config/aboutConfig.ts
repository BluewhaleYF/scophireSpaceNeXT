import type { AboutConfig } from "../types/aboutConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const aboutConfig: AboutConfig = withUserConfig("about", {
	enable: true,
	title: "$t:about",
	description: "$t:about",
	// 正文上方的个人简介区块：头像与名称取自 profileConfig，
	// 下列信息块按顺序两列排列（每行 2 个）。省略 intro 或 enable: false 时整块不渲染。
	intro: {
		enable: true,
		tagline: "当有一天你不再纠结于答案，当我们又重逢于天涯或沧海",
		facts: [
			{ key: "occupation", value: "学生" },
			{ key: "birthday", value: "1月9日" },
			{ key: "location", value: "中国浙江杭州" },
			{ key: "timezone", value: "Asia/Shanghai" },
		],
	},
	// 正文上方的语言栏：每个语言一张卡片，列出名称、代码与掌握程度。
	// 桌面横屏（≥1024px）下四张卡片并排成一行；省略 languages 或 enable: false 时整块不渲染。
	languages: {
		enable: true,
		title: "$t:aboutLanguages",
		description: "$t:aboutLanguagesDescription",
		items: [
			{ name: "中文", code: "zh-CN, zh-TW", level: "母语" },
			{ name: "闽南语", code: "nan-CN", level: "母语" },
			{ name: "English", code: "en-US", level: "CEFR B2" },
			{ name: "日本語", code: "ja-JP", level: "N5" },
		],
	},
});
