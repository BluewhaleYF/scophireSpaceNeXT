import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	filterByDisabledKeys,
	resolveDevicesData,
	resolveProjectsData,
	resolveSkillsData,
	resolveTimelineData,
} from "../src/utils/feature-data.ts";

describe("Feature Data & Resolver Tests", () => {
	it("filterByDisabledKeys correctly filters items by key/id/name/title", () => {
		const items = [
			{ key: "item-1", name: "One" },
			{ key: "item-2", name: "Two" },
			{ key: "item-3", name: "Three" },
		];

		const filtered = filterByDisabledKeys(items, ["item-2"]);
		assert.equal(filtered.length, 2);
		assert.deepEqual(
			filtered.map((i) => i.key),
			["item-1", "item-3"],
		);
	});

	it("resolveProjectsData applies disabledKeys correctly", () => {
		const items = [
			{ key: "keep-a", title: "A" },
			{ key: "drop", title: "B" },
			{ key: "keep-b", title: "C" },
		];
		const config = {
			enable: true,
			categories: [],
			disabledKeys: ["drop"],
		};
		const resolved = resolveProjectsData(config, items);
		assert.deepEqual(
			resolved.map((p) => p.key),
			["keep-a", "keep-b"],
		);
	});

	it("resolveSkillsData applies disabledNames correctly", () => {
		const items = [
			{ name: "TypeScript", level: "advanced" },
			{ name: "PHP", level: "beginner" },
		];
		const config = {
			enable: true,
			categories: [],
			disabledNames: ["PHP"],
		};
		const resolved = resolveSkillsData(config, items);
		assert.deepEqual(
			resolved.map((s) => s.name),
			["TypeScript"],
		);
	});

	it("resolveTimelineData applies disabledTitles and order correctly", () => {
		const items = [
			{ title: "Older Role", date: "2020.09" },
			{ title: "Senior Frontend Engineer", date: "2021.01" },
			{ title: "Newest Role", date: "2024.06" },
		];
		const config = {
			enable: true,
			categories: [],
			order: "asc",
			disabledTitles: ["Senior Frontend Engineer"],
		};
		const resolved = resolveTimelineData(config, items);
		assert.deepEqual(
			resolved.map((t) => t.title),
			["Older Role", "Newest Role"],
		);
	});

	it("resolveTimelineData sorts correctly by date in desc and asc order", () => {
		const customItems = [
			{ title: "Old", date: "2021.05" },
			{ title: "Recent", date: "2024.10" },
			{ title: "Present", date: "2025.01 - Present" },
			{ title: "Middle", date: "2023.01" },
		];
		const descRes = resolveTimelineData({ order: "desc" }, customItems);
		assert.deepEqual(
			descRes.map((i) => i.title),
			["Present", "Recent", "Middle", "Old"],
		);

		const ascRes = resolveTimelineData({ order: "asc" }, customItems);
		assert.deepEqual(
			ascRes.map((i) => i.title),
			["Old", "Middle", "Recent", "Present"],
		);
	});

	it("resolveDevicesData applies disabledIds correctly", () => {
		const items = [
			{ id: "keep-a", name: "A", brand: "X" },
			{ id: "drop", name: "B", brand: "Y" },
		];
		const config = {
			enable: true,
			categories: [],
			disabledIds: ["drop"],
		};
		const resolved = resolveDevicesData(config, items);
		assert.deepEqual(
			resolved.map((d) => d.id),
			["keep-a"],
		);
	});
});
