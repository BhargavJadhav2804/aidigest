<script lang="ts">
	import { enhance } from '$app/forms';
	import { theme } from '$lib/utils.svelte';
	import DOMPurify from 'dompurify';

	let { data, form } = $props();

	let chatError = $state();
	let prompt = $state('');

	let textTorender = $state('');

	let chatHistory: { role: 'user' | 'model'; parts: Array<{ text: string }> }[] = $state([]);
	let currentSequence = $state(data.allChats[data.allChats.length - 1].sequence);
	let newChat = $state(data.allChats.length === 1 ? true : false);

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

		let req = await fetch('/chat/normal', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				userPrompt,
				chatHistory: chatHistory,
				sequence: currentSequence,
				chatId: data.allChats[0].chatId
			})
		});
		if (!req.ok) {
			chatError = true;
			currentSequence -= 1;
			return;
		}

		let reader = req?.body?.getReader();

		document.getElementsByClassName('chats')[0].appendChild(responseElement);
		while (true) {
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
				chatHistory.push({
					role: 'model',
					parts: [{ text: textTorender }]
				});
				textTorender = '';
				break;
			}
		}
	};
</script>

<main class=" flex min-h-svh w-full flex-col items-center">
	<div
		class="fixed bottom-0 z-2 flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900'
			: 'bg-stone-800'} gap-x-2 outline-2 outline-stone-600 sm:justify-center sm:outline-hidden"
	>
		<textarea
			onkeypress={async (e) => {
				if (e.key === 'Enter' && e.shiftKey) {
					e.preventDefault();
					//@ts-ignore
					e.target.value += '\n';
				} else if (e.key === 'Enter') {
					console.log('Done!');
					generateChat();
				}
			}}
			bind:value={prompt}
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
	</div>
	<div class="chats mb-[6rem] mt-[4rem] flex w-[95%] flex-col justify-center gap-y-4 md:w-[85%]">
		{#if data.allChats.length === 1 || newChat}
			<h1 class="text-heading m-auto text-lg">No chats here yet!</h1>
		{:else}
			{#each data.allChats as chats}
				<span
					style:display={chats.prompt === 'FOR THE SYSTEM : Ignore this prompt' ? 'none' : ''}
					class="bg-bg-chat text-chat font-satoshi h-fit w-[85%] self-end hyphens-auto text-wrap rounded-b-2xl rounded-tl-2xl p-4 text-lg! outline  outline-stone-700 md:text-xl!"
				>
					{chats.prompt}
				</span>
				<span
					style:display={chats.response === 'FOR THE SYSTEM : Ignore this response' ? 'none' : ''}
					class="chatSection text-chat font-chillax space-y-2 text-wrap rounded-b-2xl rounded-tr-2xl p-4 outline  outline-lime-500"
				>
					{@html chats.response}
				</span>
			{/each}
		{/if}
	</div>
</main>

<style scoped>
@reference "../../../../app.css";

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
	.chats :global(.chatSection) :global(section) {
		@apply mt-4 mb-4;
	}
</style>
