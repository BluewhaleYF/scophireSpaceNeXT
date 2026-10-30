<script lang="ts">
import Button from "@components/atoms/action/Button.svelte";
import Card from "@components/atoms/display/Card.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { showSnackbar } from "@utils/snackbar";
import { onDestroy } from "svelte";

/**
 * 友链申请卡片：本站信息模板（可一键复制）+ 预填 mailto 的申请入口。
 * 渲染在友链列表下方；数据由 utils/friend-apply.ts 在构建期解析。
 */
let {
	email = "",
	mailto = "",
	snippet = "",
	class: className = "",
}: {
	/** 收件邮箱（展示在 mailto 按钮旁） */
	email?: string;
	/** 预填主题与正文的 mailto 链接；为空时不渲染邮件入口 */
	mailto?: string;
	/** 供复制的本站信息 YAML 片段 */
	snippet?: string;
	class?: string;
} = $props();

let copied = $state(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;

async function copySiteInfo() {
	if (typeof navigator === "undefined" || !navigator.clipboard) {
		showSnackbar(i18n(I18nKey.friendsApplyCopyFailed));
		return;
	}

	try {
		await navigator.clipboard.writeText(snippet);
		copied = true;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copied = false;
		}, 2000);
	} catch {
		showSnackbar(i18n(I18nKey.friendsApplyCopyFailed));
	}
}

onDestroy(() => {
	if (copyTimer) clearTimeout(copyTimer);
});
</script>

<Card
	color="var(--card-bg)"
	radius="l"
	class={`friend-apply-card p-5 sm:p-8 ${className}`}
>
	<div class="friend-apply-card__inner">
		<header class="friend-apply-card__header">
			<h2 class="friend-apply-card__title">
				<span class="friend-apply-card__icon" aria-hidden="true">
					<Icon icon="material-symbols:add-link-rounded" />
				</span>
				{i18n(I18nKey.friendsApplyTitle)}
			</h2>
			<p class="friend-apply-card__subtitle">
				{i18n(I18nKey.friendsApplyDescription)}
			</p>
		</header>

		<div class="friend-apply-card__snippet">
			<div class="friend-apply-card__snippet-header">
				<span class="friend-apply-card__snippet-label">
					<Icon
						icon="material-symbols:badge-outline-rounded"
						aria-hidden="true"
					/>
					{i18n(I18nKey.friendsApplySiteInfo)}
				</span>
				<button
					type="button"
					class="friend-apply-card__copy m3-state-layer"
					onclick={copySiteInfo}
					aria-label={i18n(
						copied ? I18nKey.friendsApplyCopied : I18nKey.friendsApplyCopy,
					)}
				>
					<Icon
						icon={copied
							? "material-symbols:check-rounded"
							: "material-symbols:content-copy-outline-rounded"}
						aria-hidden="true"
					/>
					<span aria-live="polite">
						{i18n(
							copied ? I18nKey.friendsApplyCopied : I18nKey.friendsApplyCopy,
						)}
					</span>
				</button>
			</div>
			<pre class="friend-apply-card__code"><code>{snippet}</code></pre>
		</div>

		{#if mailto}
			<div class="friend-apply-card__actions">
				<Button
					variant="filled"
					size="small"
					icon="material-symbols:mail-rounded"
					label={i18n(I18nKey.friendsApplySend)}
					href={mailto}
				/>
				<span class="friend-apply-card__email-tip">
					{#each i18n(I18nKey.friendsApplyEmailTip).split(/(\{email\})/g) as part, index (index)}
						{#if part === "{email}"}<code>{email}</code>{:else}{part}{/if}
					{/each}
				</span>
			</div>
		{/if}
	</div>
</Card>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.friend-apply-card
	&__inner
		display: flex
		flex-direction: column
		gap: var(--m3e-space-4)

	&__header
		display: flex
		flex-direction: column
		gap: 0.375rem

	&__title
		display: flex
		align-items: center
		gap: var(--m3e-space-3)
		margin: 0
		color: var(--on-surface)
		font: var(--m3e-type-title-medium)
		font-weight: 600

	&__icon
		display: inline-flex
		align-items: center
		justify-content: center
		color: var(--primary)
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__subtitle
		margin: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-medium)
		line-height: 1.6

	&__snippet
		border: 1px solid var(--outline-variant)
		border-radius: var(--shape-corner-m)
		background: var(--surface-container-high)
		overflow: hidden

	&__snippet-header
		display: flex
		align-items: center
		justify-content: space-between
		gap: var(--m3e-space-2)
		padding: var(--m3e-space-2) var(--m3e-space-4)
		border-bottom: 1px solid var(--outline-variant)
		background: unquote("color-mix(in oklab, var(--on-surface) 4%, var(--surface-container-high))")

	&__snippet-label
		display: inline-flex
		align-items: center
		gap: 0.375rem
		min-width: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-medium)
		font-weight: 600
		> :global(svg)
			width: 1rem
			height: 1rem
			flex-shrink: 0
			color: var(--primary)

	&__copy
		display: inline-flex
		align-items: center
		flex-shrink: 0
		gap: 0.25rem
		padding: 0.25rem 0.625rem
		border: 1px solid var(--outline-variant)
		border-radius: var(--shape-corner-full)
		background: var(--surface-container-highest)
		color: var(--on-surface)
		font: var(--m3e-type-label-small)
		font-weight: 600
		cursor: pointer
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			border-color var(--m3e-duration-short) var(--m3e-easing-standard)
		> :global(svg)
			width: 0.875rem
			height: 0.875rem
		&:hover
			border-color: var(--primary)

	&__code
		margin: 0
		padding: var(--m3e-space-3) var(--m3e-space-4)
		overflow-x: auto
		color: var(--on-surface)
		font-family: var(--m3e-font-mono-family)
		font-size: 0.875rem
		line-height: 1.6
		tab-size: 2
		white-space: pre

	&__actions
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: var(--m3e-space-4)

	&__email-tip
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)
		> code
			padding: 0.125rem 0.375rem
			border-radius: var(--shape-corner-xs)
			background: var(--surface-container-high)
			color: var(--primary)
			font-family: var(--m3e-font-mono-family)

	@media (max-width: bp-sm - 1px)
		&__code
			white-space: pre-wrap
			overflow-wrap: anywhere

		&__actions
			flex-direction: column
			align-items: stretch

</style>
