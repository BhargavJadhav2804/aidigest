<script lang="ts">
	import { toast } from '$lib';
	import { fly } from 'svelte/transition';
	import '../app.css';
	import '../global.css';
	import '$lib/assets/fonts.css';
	import NAV from '$lib/components/Nav.svelte';
	import { bounceInOut, cubicInOut } from 'svelte/easing';
	import { theme } from '$lib/utils.svelte';
	
	let { children } = $props();
</script>

<NAV />
{@render children()}

{#if $toast}
	<div
		transition:fly={{ duration: 175, easing: bounceInOut, y: '-75px' }}
		class="fixed bottom-2 left-[50%] z-51 flex min-h-[75px] w-[90%] translate-x-[-50%] flex-col gap-y-2 rounded-lg bg-stone-300 p-2 font-generalSans outline-2 outline-red-600"
	>
		<h1 class="text-lg">{$toast.title}</h1>
		<span> {$toast.description}</span>
	</div>
{/if}
