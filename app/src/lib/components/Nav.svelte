<script lang="ts">
	import { createSwitch, melt } from '@melt-ui/svelte';
	import LOGO from './LOGO.svelte';
	import { theme } from '$lib/utils.svelte';
	import { browser } from '$app/environment';

	const {
		elements: { root, input },
		states: { checked }
	} = createSwitch({
		defaultChecked: browser && localStorage.getItem('theme') === 'light' ? false : true
	});

	$effect(() => {
		if ($checked) {
			theme.theme = 'dark';
			document.getElementsByTagName('html')[0].dataset.theme = 'dark';
			localStorage.setItem('theme', 'dark');
		} else if (!$checked) {
			theme.theme = 'light';
			document.getElementsByTagName('html')[0].dataset.theme = 'light';
			localStorage.setItem('theme', 'light');
		}
		// document.getElementsByTagName('html')[0].dataset.theme =
		// 	localStorage.getItem('theme') ?? 'light';
	});
</script>

<nav
	class="fixed top-0 z-10 flex w-full justify-between {theme.theme === 'dark'
		? 'bg-linear-to-b from-stone-800/80 to-stone-800/10'
		: ''} backdrop-blur-xs p-1 py-2"
>
	<div class="flex gap-x-4 items-center">
		<LOGO />

		<span class="md:text-base text-sm rounded-lg bg-indigo-500 px-1 py-1 font-satoshi"> In BETA!, you might experience some issues</span>




	</div>
	<div class="flex items-center">
		<button
			use:melt={$root}
			class="relative h-7 cursor-pointer rounded-full {theme.theme === 'dark'
				? 'bg-stone-600'
				: 'bg-stone-400'} transition-colors data-[state=checked]:bg-stone-500"
			id="airplane-mode"
			aria-labelledby="airplane-mode-label"
		>
			<span class="thumb block rounded-full bg-transparent transition">
				{#if $checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-moon stroke-stone-300"
						><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
					>
				{:else if !$checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-sun stroke-stone-800"
						><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
							d="m4.93 4.93 1.41 1.41"
						/><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
							d="m6.34 17.66-1.41 1.41"
						/><path d="m19.07 4.93-1.41 1.41" /></svg
					>
				{/if}
			</span>
		</button>
		<input use:melt={$input} />
	</div>
</nav>

<style>
	button {
		--w: 3.25rem;
		--padding: 0.25rem;
		width: var(--w);
	}

	.thumb {
		--size: 1.25rem;
		width: var(--size);
		height: var(--size);
		transform: translateX(var(--padding));
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
	}
</style>
