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
		tagline: "Better code, bigger world",
		facts: [
			{ key: "occupation", value: "学生" },
			{ key: "birthday", value: "1月9日" },
			{ key: "location", value: "中国浙江杭州" },
			{ key: "timezone", value: "Asia/Shanghai" },
		],
	},
});
