<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog({});
</script>

{#snippet forward(className: string)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="35"
		height="35"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-corner-down-right absolute {className} hidden sm:block"
		><polyline points="15 10 20 15 15 20" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg
	>

	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="32"
		height="32"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-chevrons-down block translate-y-[10px] self-center sm:hidden"
		><path d="m7 6 5 5 5-5" /><path d="m7 13 5 5 5-5" /></svg
	>
{/snippet}
<button
	use:melt={$trigger}
	class="font-['Chillax',sans-serif;] text-xl underline decoration-lime-600 decoration-wavy sm:text-2xl"
	>How does it work?</button
>
{#if $open}
	<div use:melt={$portalled}>
		<div class="fixed inset-0 z-[2] bg-black/50" use:melt={$overlay} />
		<div
			transition:fly={{ duration: 250, y: '25px' }}
			use:melt={$content}
			class="dialog-elem fixed left-1/2 top-1/2 z-50 flex max-h-[85svh]
        w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-6 space-y-4 self-start overflow-y-auto rounded-xl bg-sky-200 p-4 font-['Chillax',sans-serif;] focus:outline-none"
		>
			<div class=" flex flex-col items-center gap-y-8 text-lg sm:items-baseline sm:text-xl">
				<p class="relative flex flex-col sm:block sm:self-start">
					<b class="rounded-bl-xl rounded-tr-xl border-2 border-dashed border-lime-500 p-2"
						>You upload a pdf file / youtube link</b
					>
					{@render forward('-left-1 lg:left-[10%]  top-12')}
				</p>

				<p class="relative flex flex-col text-center sm:block sm:self-center">
					<b class="rounded-bl-xl rounded-tr-xl border-2 border-dashed border-lime-500 p-2"
						>We then extract the data and break it down in chunks
					</b>
					{@render forward('right-[50%] top-14')}
				</p>

				<p
					class="w-[85%] rounded-bl-xl rounded-tr-xl border-2 border-dashed border-lime-500 p-2 font-semibold sm:w-[45%] sm:self-end"
				>
					After that we send it to apply an AI magic which transforms the data in suitable format
					for further purpose (This happens only once, so you can enjoy seamless and swift
					experience!)
				</p>
			</div>
		</div>
	</div>
{/if}
