/**
 * `pnpm merge:check` — 合并上游主题更新时的统一门禁。
 *
 * 背景见 `docs/upstream-merge.md`：本仓库是个人站，已与上游脱离 fork 关系，
 * 但保留手动合并 LyraVoid/Shirone 更新的能力。合并后的验收不能只靠
 * `git merge` 是否冲突，必须跑完本脚本的全部步骤。
 *
 * 依次执行：
 *   1. `astro check`（0 errors）
 *   2. `biome ci ./src`（只读 lint，不改文件）
 *   3. `node --test "tests/**\/*.test.mjs"`（内容无关的单元测试）
 *   4. `playwright test tests/site`（内容无关的站点冒烟）
 *
 * 传 `--build` 时追加生产构建（`pnpm build`），用于高风险合并（样式、字体、
 * Markdown 管线、打包集成）。普通合并不必每次构建。
 *
 * 用 Node 而不是 shell 串联步骤：Windows 下 `&&` 链与 `.cmd` 后缀的行为
 * 不一致，且这里需要逐段打印结果，避免 CI 日志里只看到一个 exit code。
 */
import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const withBuild = process.argv.includes("--build");

/** @type {Array<{ name: string; script: string; args: string[] }>} */
const steps = [
	{ name: "Astro diagnostics", script: "exec", args: ["astro", "check"] },
	{ name: "Biome (read-only)", script: "exec", args: ["biome", "ci", "./src"] },
	{
		name: "Unit tests",
		script: "exec",
		args: ["node", "--test", "tests/**/*.test.mjs"],
	},
	{
		name: "Playwright smoke",
		script: "exec",
		args: ["playwright", "test", "tests/site"],
	},
];

if (withBuild) {
	steps.push({ name: "Production build", script: "build", args: [] });
}

let failed = false;
for (const step of steps) {
	process.stdout.write(`\n▶ ${step.name}\n`);
	const result = spawnSync(pnpm, [step.script, ...step.args], {
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.error) {
		console.error(`\n✖ ${step.name} 无法启动：${result.error.message}`);
		failed = true;
		break;
	}
	if (result.status !== 0) {
		console.error(
			`\n✖ ${step.name} 失败（exit ${result.status ?? "unknown"}）。先修复这一步，再继续合并。`,
		);
		failed = true;
		break;
	}
}

if (failed) {
	process.exit(1);
}

process.stdout.write(
	`\n✔ merge:check 全部通过${withBuild ? "（含生产构建）" : ""}。\n`,
);
