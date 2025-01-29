<script lang="ts">
	import { toast } from '$lib';
	import { fly } from 'svelte/transition';
	import '../app.css';
	import '../global.css';
	import '$lib/assets/fonts.css';
	import NAV from '$lib/components/Nav.svelte';
	import { bounceInOut } from 'svelte/easing';
	import { hideWarning } from '$lib/utils.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics();

	let { children } = $props();
</script>
{#if !hideWarning.hide}
	<div
		transition:fly={{ duration: 200, y: '10px' }}
		class="text-heading bg-bg-chat/50 font-generalSans z-100 fixed top-0 flex w-full items-center justify-center py-3 text-start text-base backdrop-blur-lg sm:text-lg"
	>
		AIdigest isn't still fully stable or error free, you may experience some issues.
		<button
		    aria-label="Close"
			onclick={() => {
				hideWarning.hide = true;
			}}
			class="absolute bottom-1 right-2 text-lg"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-circle-x"
				><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg
			>
		</button>
	</div>
{/if}

<NAV />
{@render children()}

{#if $toast}
	<div
		transition:fly={{ duration: 175, easing: bounceInOut, y: '-75px' }}
		class="z-51 font-generalSans fixed bottom-2 left-[50%] flex min-h-[75px] w-[90%] translate-x-[-50%] flex-col gap-y-2 rounded-lg bg-stone-300 p-2 outline-2 outline-red-600"
	>
		<h1 class="text-lg">{$toast.title}</h1>
		<span> {$toast.description}</span>
	</div>
{/if}
