<script lang="ts">
	import { theme } from '$lib/utils.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	console.log(data);
</script>

<main class=" flex min-h-svh w-full flex-col items-center">
	<!-- <div
		class="fixed bottom-0 z-[2] flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900'
			: 'bg-stone-800'} gap-x-2 outline outline-2 outline-stone-600 sm:justify-center sm:outline-none"
	>
		<textarea
			disabled
			name="prompt"
			rows="3"
			placeholder="Type something!"
			class="font-generalSans peer z-[2] max-h-[10rem] min-h-[4rem] w-[95%] resize-y rounded-none border-r-stone-700 {theme.theme ===
			'dark'
				? 'bg-stone-900'
				: 'bg-stone-800'} px-3 py-2 text-stone-300 outline-none focus:border-r sm:w-[85%] sm:rounded-t-lg sm:border sm:border-b-0 sm:border-x-stone-700 sm:border-t-stone-700"
			id=""
		></textarea>
		<button
			aria-labelledby="Send"
			class="block size-fit self-center rounded-full bg-stone-900 p-1 outline-1 outline-stone-700 peer-focus:outline sm:hidden"
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
				class="lucide lucide-send mt-1 size-8 rotate-[-44deg] stroke-stone-500 md:size-10"
				><path
					d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
				/><path d="m21.854 2.147-10.94 10.939" /></svg
			></button
		>
	</div> -->

	<div class="mt-[5rem] flex w-[90%] flex-col items-center gap-y-4 md:w-[85%]">
		<!-- <iframe
			class="aspect-video h-full w-[65%] rounded-lg"
			src="https://www.youtube.com/embed/0-7IHOXkiV8"
			title="KALEO - Way Down We Go (Official Music Video)"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe> -->

		<div class="font-chillax text-chat text-lg">
			<div class="space-y-2">
				{@html data?.allChats?.[0]?.summary ?? 'Hola'}
			</div>
		</div>
	</div>
	<div
		class="chats mb-[6rem] mt-[4rem] flex w-[95%] flex-col justify-center gap-y-4 md:w-[85%]"
	></div>
</main>

<style lang="postcss">
	.chats :global(.chatSection) :global(h1) {
		@apply text-chat text-xl md:text-2xl;
	}
	.chats :global(.chatSection) :global(h2) {
		@apply text-chat text-xl md:text-2xl;
	}

	.chats :global(.chatSection) :global(p) {
		@apply text-chat text-lg md:text-xl;
	}
	.chats :global(.chatSection) :global(span) {
		@apply text-chat text-lg md:text-xl;
	}

	.chats :global(.chatSection) :global(li) {
		@apply text-chat text-lg;
	}
	.chats :global(.chatSection) :global(ul) {
		@apply text-chat flex flex-col gap-y-3;
	}
	.chats :global(.chatSection) :global(ol) {
		@apply text-chat flex flex-col gap-y-3;
	}

	.chats :global(.chatSection) :global(pre) {
		@apply w-full overflow-x-auto rounded-lg bg-stone-800 p-1;
	}
	.chats :global(.chatSection) :global(pre code) {
		@apply !overflow-x-scroll bg-transparent;
	}

	.chats :global(.chatSection) :global(code) {
		@apply rounded-md bg-stone-700 px-1;
	}
</style>
