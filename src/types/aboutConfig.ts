import type { PageMeta } from "./pageMeta.ts";

/** 关于页顶部个人简介区块中的信息项类型（决定标签文案与图标）。 */
export type AboutIntroFactKey =
	| "occupation"
	| "birthday"
	| "location"
	| "timezone";

/** 关于页顶部个人简介区块中的单个信息项。 */
export interface AboutIntroFact {
	/** 信息类型：标签文案与图标由该类型决定 */
	key: AboutIntroFactKey;
	/** 展示值（站主内容，按原样渲染，例如 "学生"、"Asia/Shanghai"） */
	value: string;
}

/** 关于页顶部个人简介区块：头像 + 名称 + 一句话 + 信息块。 */
export interface AboutIntroConfig {
	/** 是否显示该区块；false 时不输出任何 DOM 与间距 */
	enable: boolean;
	/** 名称下方的一句话（站主内容，按原样渲染） */
	tagline?: string;
	/**
	 * 信息块列表，按顺序以两列网格排列（每行 2 个，最后一行可只有 1 个）。
	 * 为空时不渲染区块。
	 */
	facts: AboutIntroFact[];
}

/** 关于页语言栏中的单个语言。 */
export interface AboutLanguageItem {
	/** 语言名称（站主内容，按原样渲染，例如 "中文"、"English"） */
	name: string;
	/** 语言代码（站主内容，例如 "zh_CN, zh_TW"、"en_US"） */
	code: string;
	/** 掌握程度（站主内容，例如 "母语"、"CEFR B2"、"N5"） */
	level: string;
}

/** 关于页语言栏：标题 + 描述 + 语言卡片列表。 */
export interface AboutLanguagesConfig {
	/** 是否显示该栏目；false 时不输出任何 DOM 与间距 */
	enable: boolean;
	/** 栏目标题：字面量，或 "$t:<i18nKey>"（默认走内置词条） */
	title?: string;
	/** 栏目描述：字面量，或 "$t:<i18nKey>"（默认走内置词条） */
	description?: string;
	/** 语言列表；桌面横屏下每个语言一张卡片并排成一行，为空时不渲染栏目 */
	items: AboutLanguageItem[];
}

export interface AboutConfig extends PageMeta {
	/** 正文上方的个人简介区块；省略时整块不渲染 */
	intro?: AboutIntroConfig;
	/** 简介与正文之间的语言栏；省略时整块不渲染 */
	languages?: AboutLanguagesConfig;
}
