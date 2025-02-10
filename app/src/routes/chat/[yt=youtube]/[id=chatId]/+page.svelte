<script lang="ts">
	import { toast } from '$lib';
	import { theme } from '$lib/utils.svelte';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';
	import { cubicInOut } from 'svelte/easing';

	let { data }: { data: PageData } = $props();
	console.log(data);

	let chatError = $state();
	let prompt = $state('');

	let textTorender = $state('');

	let chatHistory: { role: 'user' | 'model'; parts: Array<{ text: string }> }[] = $state([]);
	let currentSequence = $state(data.allChats[data.allChats.length - 1].sequence);
	let newChat = $state(data.allChats.length === 1 ? true : false);

	let responseStarted = $state(false);

	let isDocumentBottom = $state(false);

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
			'chatSection text-chat text-lg font-chillax space-y-2 text-wrap hidden rounded-b-2xl rounded-tr-2xl p-4 outline outline-1 outline-lime-500';

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

		window.scrollTo(0, document.body.scrollHeight);

		const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

		isDocumentBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
		console.log(isDocumentBottom);

		responseStarted = true;

		while (true) {
			try {
				//@ts-expect-error
				let { done, value } = await reader?.read();

				let decode = new TextDecoder()
					.decode(value)
					.replaceAll('```html', '')
					.replaceAll('```', '')
					.replace('html', '')
					.replaceAll('``', '')
					.replaceAll(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

				textTorender += decode;

				responseElement.classList.remove('hidden');

				responseElement.innerHTML = DOMPurify.sanitize(textTorender);

				if (responseStarted) {
					window.scrollTo(0, document.body.scrollHeight);
					responseStarted = false;
				}

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

	function handleWindowScroll() {
		const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

		isDocumentBottom = !(Math.ceil(scrollTop + clientHeight) >= scrollHeight);
	}
</script>

<svelte:window onscroll={handleWindowScroll} />

<main class=" flex min-h-svh w-full flex-col items-center">
	{#if isDocumentBottom}
		<button
			onclick={() => {
				window.scrollTo(0, document.body.scrollHeight);
			}}
			transition:fly={{ duration: 250, easing: cubicInOut, y: '25px' }}
			aria-label="Go to bottom"
			class="fixed bottom-[8rem] z-10 rounded-full bg-stone-900/20 p-2 backdrop-blur-xl"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="27"
				height="27"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-arrow-down stroke-stone-200"
				><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg
			>
		</button>
	{/if}
	<div
		class="z-2 fixed bottom-0 flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900 sm:bg-transparent'
			: 'bg-stone-800 sm:bg-transparent'} border-t-1 sm:outline-hidden left-[50%] translate-x-[-50%] gap-x-2 border-stone-500 sm:justify-center sm:border-t-0"
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
			class="font-generalSans z-2 peer max-h-[10rem] min-h-[5rem] w-[90%] resize-y rounded-none border-r-stone-600 {theme.theme ===
			'dark'
				? 'bg-stone-900'
				: 'border-r-2 border-r-stone-500 bg-stone-800'} outline-hidden px-3 py-2 text-stone-300 focus:border-r sm:w-[75%] sm:rounded-t-lg sm:border-2 sm:border-b-0 sm:border-x-stone-600 sm:border-t-stone-600"
			id=""
		></textarea>
		<button
			onclick={() => {
				if (!prompt || prompt.length === 0) return;
				if (!streamDone) return;
				generateChat();
			}}
			aria-labelledby="Send"
			class="mr-1 block size-fit w-[12%] self-center rounded-full bg-stone-900 p-1 outline-1 outline-stone-700 peer-focus:outline sm:hidden"
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
				class="lucide lucide-send m-auto mt-1 size-8 rotate-[-44deg] stroke-stone-500 md:size-10"
				><path
					d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
				/><path d="m21.854 2.147-10.94 10.939" /></svg
			></button
		>
	</div>
	<div class="mt-[5rem] flex w-[100%] flex-col items-center gap-y-6 md:w-[75%]">
		<iframe
			class="aspect-video h-full w-full rounded-lg"
			src={`https://www.youtube.com/embed/${data.allChats[0].ytId}`}
			title="KALEO - Way Down We Go (Official Music Video)"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>

		<div
			class="font-chillax text-chat summaryChat w-full hyphens-auto text-wrap break-words text-lg"
		>
			{@html data?.allChats?.[0]?.summary ?? 'Hola'}
		</div>
	</div>
	<div class="chats mb-[6rem] mt-[4rem] flex w-[95%] flex-col justify-center gap-y-4 md:w-[75%]">
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
					class="chatSection text-chat font-chillax space-y-2 text-pretty break-words rounded-b-2xl rounded-tr-2xl p-4 text-lg outline outline-lime-500"
				>
					{@html chats.response}
				</span>
			{/each}
		{/if}
	</div>
</main>

<style scoped>
	@reference "../../../../app.css";

	.chats :global(.chatSection > h1) {
		@apply underline-offset-5 text-lg! md:text-xl!;
	}
	.chats :global(.chatSection) :global(div) {
		@apply underline-offset-5 space-y-5 md:space-y-10;
	}
	.chats :global(.chatSection) :global(h1) {
		@apply text-chat text-xl md:text-2xl;
	}

	.chats :global(.chatSection) :global(h2) {
		@apply text-chat text-lg md:text-xl;
	}
	.chats :global(.chatSection) :global(p) {
		@apply text-chat text-lg! md:text-xl!;
	}
	.chats :global(.chatSection) :global(span) {
		@apply text-chat text-lg! md:text-xl!;
	}

	.chats :global(.chatSection) :global(li) {
		@apply text-chat text-lg;
	}
	.chats :global(.chatSection) :global(ul) {
		@apply text-chat flex flex-col gap-y-4;
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

	.summaryChat > :global(div) {
		@apply space-y-6;
	}
	.summaryChat {
		@apply space-y-6;
	}

	.summaryChat :global(h1) {
		@apply text-2xl;
	}

	.summaryChat {
		@apply underline-offset-6;
	}
	.summaryChat :global(h2) {
		@apply text-xl;
	}

	.summaryChat :global(ul) {
		@apply ml-3 space-y-4;
	}

	.chats :global(.chatSection) :global(div ul) {
		@apply ml-3;
	}
</style>
