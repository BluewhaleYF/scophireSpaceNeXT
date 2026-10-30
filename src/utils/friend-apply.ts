import { friendsConfig } from "../config/friendsConfig.ts";
import { siteConfig } from "../config/siteConfig.ts";
import I18nKey from "../i18n/i18nKey.ts";
import { i18n } from "../i18n/translation.ts";
import type {
	FriendApplyConfig,
	FriendApplySiteInfo,
} from "../types/friendsConfig.ts";
import { toAbsoluteUrl } from "./url-utils.ts";

/**
 * 友链申请卡片的数据解析（构建期纯函数）。
 * 配置管行为（开关 / 邮箱 / 覆盖字段），回退值取自 siteConfig，
 * 输出访客可直接复制的 YAML 片段与预填好的 mailto 链接。
 */
export interface ResolvedFriendApply {
	/** 收件邮箱；为空表示只提供复制，不提供邮件入口 */
	email: string;
	/** 申请模板中的本站信息（已补齐回退值） */
	siteInfo: FriendApplySiteInfo;
	/** 供访客复制的 YAML 片段 */
	snippet: string;
	/** 预填主题与正文的 mailto 链接；无邮箱时为空字符串 */
	mailto: string;
}

/** YAML 双引号字符串转义（只处理会破坏片段的引号与反斜杠） */
function quoteYaml(value: string): string {
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** 把本站信息序列化成与 src/data/friends.ts 同构的 YAML 片段 */
export function formatFriendApplySnippet(info: FriendApplySiteInfo): string {
	return [
		`title: ${quoteYaml(info.title)}`,
		`imgurl: ${quoteYaml(info.imgurl)}`,
		`desc: ${quoteYaml(info.desc)}`,
		`siteurl: ${quoteYaml(info.siteurl)}`,
		`tags: [${info.tags.map(quoteYaml).join(", ")}]`,
	].join("\n");
}

/** 用消费方提供的值替换 i18n 模板中的 {placeholder} */
function fillTemplate(
	template: string,
	values: Record<string, string>,
): string {
	return Object.entries(values).reduce(
		(text, [name, value]) => text.split(`{${name}}`).join(value),
		template,
	);
}

/**
 * 解析申请卡片配置；关闭或未配置时返回 null（消费方据此不渲染任何 DOM）。
 */
export function resolveFriendApply(
	config: FriendApplyConfig | undefined = friendsConfig.apply,
): ResolvedFriendApply | null {
	if (!config?.enable) return null;

	const override = config.siteInfo ?? {};
	const siteInfo: FriendApplySiteInfo = {
		title: override.title?.trim() || siteConfig.title,
		imgurl:
			override.imgurl?.trim() ||
			toAbsoluteUrl("/logo/icon.png", siteConfig.site),
		desc: override.desc?.trim() || siteConfig.subtitle,
		siteurl: override.siteurl?.trim() || siteConfig.site,
		tags: override.tags?.length ? [...override.tags] : ["Friend"],
	};

	const snippet = formatFriendApplySnippet(siteInfo);
	const email = config.email?.trim() ?? "";
	const subject = fillTemplate(i18n(I18nKey.friendsApplyMailSubject), {
		siteTitle: siteInfo.title,
	});
	const body = fillTemplate(i18n(I18nKey.friendsApplyMailBody), {
		siteTitle: siteInfo.title,
		siteInfo: snippet,
	});

	return {
		email,
		siteInfo,
		snippet,
		mailto: email
			? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
			: "",
	};
}
