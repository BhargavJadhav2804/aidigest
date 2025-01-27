<script lang="ts">
	import { toast } from '$lib';
	import { theme } from '$lib/utils.svelte';
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';

	let { data }: { data: PageData } = $props();
	console.log(data);

	let chatError = $state();
	let prompt = $state('');

	let textTorender = $state('');

	let chatHistory: { role: 'user' | 'model'; parts: Array<{ text: string }> }[] = $state([]);
	let currentSequence = $state(data.allChats[data.allChats.length - 1].sequence);
	let newChat = $state(data.allChats.length === 1 ? true : false);

	let streamDone = $state(true);

	$inspect('stream done :', streamDone);
	data.allChats.forEach((x) => {
		chatHistory.push(
			{
				role: 'user',
				parts: [
					{
						text: x.prompt
					}
				]
			},
			{
				role: 'model',
				parts: [
					{
						text: x.response
					}
				]
			}
		);
	});

	$inspect(chatHistory, '\n', data.allChats, '\n', currentSequence);

	let generateChat = async () => {
		streamDone = false;
		let userPrompt = prompt;
		prompt = '';
		console.log('USERPROMPT:', userPrompt);
		chatHistory.push({
			role: 'user',
			parts: [{ text: userPrompt }]
		});

		let promptElem = document.createElement('span');
		promptElem.className =
			'bg-bg-chat text-chat h-fit font-satoshi self-end p-4 text-lg! md:text-xl! rounded-b-2xl w-[85%] rounded-tl-2xl outline outline-1 outline-stone-700 text-wrap hyphens-auto';

		promptElem.textContent = userPrompt;
		newChat = false;
		document.getElementsByClassName('chats')[0].appendChild(promptElem);
		currentSequence += 1;
		window.scrollTo(0, document.body.scrollHeight);

		let responseElement = document.createElement('div');

		responseElement.className =
			'chatSection text-chat font-chillax space-y-2 text-wrap hidden rounded-b-2xl rounded-tr-2xl p-4 outline outline-1 outline-lime-500';

		console.log('UP:', userPrompt);

		let req = await fetch('/api/yt', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				userPrompt,
				chatHistory: chatHistory,
				sequence: currentSequence,
				chatId: data.allChats[0].chatId,
				ytVideoId: data?.allChats[0]?.ytId ?? null,
				videoSummary: data.allChats[0].summary
			})
		});
		if (!req.ok) {
			chatError = true;
			currentSequence -= 1;
			toast.set({
				title: 'Something went wrong!',
				description: 'Please try again'
			});
			console.log('YT_CHAT_ERROR:', await req.json());
			return;
		}

		let reader = req?.body?.getReader();

		document.getElementsByClassName('chats')[0].appendChild(responseElement);
		while (true) {
			try {
				//@ts-expect-error
				let { done, value } = await reader?.read();

				let decode = new TextDecoder()
					.decode(value)
					.replaceAll('```html', '')
					.replaceAll('```', '')
					.replace('html', '')
					.replaceAll('``', '');

				textTorender += decode;

				responseElement.classList.remove('hidden');

				responseElement.innerHTML = DOMPurify.sanitize(textTorender);
				window.scrollTo(0, document.body.scrollHeight);

				if (done) {
					console.log('Done!');
					chatHistory.push({
						role: 'model',
						parts: [{ text: textTorender }]
					});
					streamDone = true;
					textTorender = '';
					break;
				}
			} catch (err) {
				toast.set({
					title: 'Something went wrong!',
					description: 'Please try again'
				});
			}
		}
	};
</script>

<main class=" flex min-h-svh w-full flex-col items-center">
	<!-- <div
		class="fixed bottom-0 z-2 flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900'
			: 'bg-stone-800'} gap-x-2 outline outline-2 outline-stone-600 sm:justify-center sm:outline-hidden"
	>
		<textarea
			disabled
			name="prompt"
			rows="3"
			placeholder="Type something!"
			class="font-generalSans peer z-2 max-h-[10rem] min-h-[4rem] w-[95%] resize-y rounded-none border-r-stone-700 {theme.theme ===
			'dark'
				? 'bg-stone-900'
				: 'bg-stone-800'} px-3 py-2 text-stone-300 outline-hidden focus:border-r sm:w-[85%] sm:rounded-t-lg sm:border sm:border-b-0 sm:border-x-stone-700 sm:border-t-stone-700"
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
	<div
		class="z-2 fixed bottom-0 flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900'
			: 'bg-stone-800'} sm:outline-hidden gap-x-2 outline-2 outline-stone-600 sm:justify-center"
	>
		<textarea
			onkeypress={async (e) => {
				if (e.key === 'Enter' && e.shiftKey) {
					e.preventDefault();
					//@ts-ignore
					e.target.value += '\n';
				} else if (e.key === 'Enter') {
					if (!prompt || prompt.length === 0) return;
					if (!streamDone) return;
					generateChat();
				}
			}}
			bind:value={prompt}
			name="prompt"
			rows="3"
			placeholder="Type something"
			class="font-generalSans z-2 peer max-h-[10rem] min-h-[5rem] w-[95%] resize-y rounded-none border-r-stone-700 {theme.theme ===
			'dark'
				? 'bg-stone-900'
				: 'bg-stone-800'} outline-hidden px-3 py-2 text-stone-300 focus:border-r sm:w-[85%] sm:rounded-t-lg sm:border sm:border-b-0 sm:border-x-stone-700 sm:border-t-stone-700"
			id=""
		></textarea>
		<button
			onclick={() => {
				if (!prompt || prompt.length === 0) return;
				if (!streamDone) return;
				generateChat();
			}}
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
	</div>
	<div class="mt-[5rem] flex w-[90%] flex-col items-center gap-y-6 md:w-[80%]">
		<iframe
			class="aspect-video h-full w-full rounded-lg"
			src={`https://www.youtube.com/embed/${data.allChats[0].ytId}`}
			title="KALEO - Way Down We Go (Official Music Video)"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>

		<div class="font-chillax text-chat summaryChat text-lg">
			{@html data?.allChats?.[0]?.summary ?? 'Hola'}
		</div>
	</div>
	<div class="chats mb-[6rem] mt-[4rem] flex w-[95%] flex-col justify-center gap-y-4 md:w-[85%]">
		{#if newChat}
			<h1 class="text-heading font-satoshi">No chats here yet!</h1>
		{:else}
			{#each data.allChats as chats}
				<span
					style:display={chats.prompt === 'THE VIDEO SUMMARY' && chats.sequence === 0 ? 'none' : ''}
					class="bg-bg-chat text-chat font-satoshi text-lg! md:text-xl! h-fit w-[85%] self-end hyphens-auto text-wrap rounded-b-2xl rounded-tl-2xl p-4 outline outline-stone-700"
				>
					{chats.prompt}
				</span>
				<span
					style:display={chats.response === 'SAME AS SUMMARY' && chats.sequence === 0 ? 'none' : ''}
					class="chatSection text-chat font-chillax space-y-2 text-wrap rounded-b-2xl rounded-tr-2xl p-4 outline outline-lime-500"
				>
					{@html chats.response}
				</span>
			{/each}
		{/if}
	</div>
</main>

<style scoped>
	@reference "../../../../app.css"
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

	.chats :global(.chatSection) {
		@apply text-lg;
	}
	.summaryChat {
		@apply space-y-3;
	}

	.summaryChat :global(h1) {
		@apply text-2xl;
	}
	.summaryChat :global(h2) {
		@apply text-xl;
	}
</style>
