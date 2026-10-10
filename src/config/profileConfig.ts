import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/profile.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Flint Scophire",
	bio: "Better code, brighter world.",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/BluewhaleYF",
		},
    {
      name: "Mastodon",
      icon: "fa7-brands:mastodon",
      url: "https://mastodon.social/@scophire",
    },
    {
      name: "Bilibili",
      icon: "fa7-brands:bilibili",
      url: "https://space.bilibili.com/1360046719",
    },
    {
      name: "E-mail",
      icon: "fa7-solid:envelope",
      url: "mailto:scophire@proton.me"
    }
	],
});
