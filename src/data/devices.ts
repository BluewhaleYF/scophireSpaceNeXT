/**
 * 设备展示页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/devicesConfig.ts 控制。
 */
import type { DeviceItem } from "@/types/devicesConfig";

export const devicesData: DeviceItem[] = [
	{
		id: "iphone-16-pro-max",
		name: "iPhone 16 Pro Max",
		brand: "Apple",
		category: "mobile",
		status: "active",
		specs: "沙漠钛金属 / 512GB / iOS 27",
		description:
			"设计质感和性能表现都足够旗舰，但高负载下发热明显，重载久了手感会打折扣。",
		icon: "material-symbols:phone-iphone",
		featured: true,
		year: "2024",
	},
	{
		id: "matebook-d14",
		name: "Matebook D 14",
		brand: "HUAWEI",
		category: "desk",
		status: "active",
		specs: "Core i7-1360P / 16GB / 1TB / Ubuntu & Windows",
		description:
			"性能孱弱，图形任务力不从心。接口较少，创作扩展举步维艰。屏幕欠佳，视觉效果不堪入目。做工粗糙，结构松散，耐用性差，性价比低。处处将就，绝不推荐。",
		icon: "material-symbols:laptop-windows-outline-rounded",
		featured: false,
		year: "2023",
	},
	{
		id: "airpods-pro",
		name: "AirPods Pro 2",
		brand: "Apple",
		category: "audio",
		status: "active",
		specs: "USB-C 充电盒",
		description: "顶级降噪和苹果生态的无缝体验，当下最省心的随身降噪之选。",
		icon: "material-symbols:earbud-left-outline-rounded",
		featured: true,
		year: "2023",
	},
	{
		id: "vgn-v87",
		name: "VGN V87",
		brand: "VGN",
		category: "peripheral",
		status: "active",
		specs: "87 键 / ANSI",
		description: "高性价比，手感优秀，自定义便捷。",
		icon: "material-symbols:keyboard-outline-rounded",
		featured: true,
		year: "2025",
	},
	{
		id: "apple-watch-s7",
		name: "Apple Watch Series 7",
		brand: "Apple",
		category: "wearable",
		status: "active",
		specs: "41mm / GPS / 黑色铝合金",
		description:
			"轻巧好戴，健康监测依旧够用，妥妥钉子户。唯一短板是一天一充的续航。",
		icon: "material-symbols:watch-rounded",
		year: "2021",
	},
];

/** 获取所有设备数据列表 */
export function getDevicesList(): DeviceItem[] {
	return devicesData;
}
