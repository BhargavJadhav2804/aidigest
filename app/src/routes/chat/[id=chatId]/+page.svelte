<script lang="ts">
	import { toast } from '$lib';
	import { theme } from '$lib/utils.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	import DOMPurify from 'dompurify';

	let value: string = $state('');

	let chatHistory: { role: 'user' | 'model'; parts: Array<{ text: string }> }[] = $state([]);
	let currentSequence = $state(data.allChats[data.allChats.length - 1].sequence);
	let newChat = $state(data.allChats.length === 1 ? true : false);

	let streamDone = $state(true);

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

	//$inspect(data.allChats, '\n', currentSequence, '\n', chatHistory);

	let content = $state('');
	let accumulatedText = $state('');

	function decodeText(text: string) {
		return text
			.replace(/\\n/g, '\n') // Decode newlines
			.replace(/\\"/g, '"') // Decode quotes
			.replace(/\\\\/g, '\\') // Decode backslashes
			.replace(/\\u([\da-f]{4})/gi, (match, hex) => {
				// Decode Unicode
				return String.fromCharCode(parseInt(hex, 16));
			})
			.replace(/&lt;/g, '<') // Decode &lt; to <
			.replace(/&gt;/g, '>') // Decode &gt; to >
			.replace(/&amp;/g, '&') // Decode &amp; to &
			.replace(/&quot;/g, '"') // Decode &quot; to "
			.replace(/&apos;/g, "'") // Decode &apos; to '
			.replace(/ /g, ' ')
			.replaceAll('```html', '')
			.replaceAll('```', '')
			.replaceAll(
				'/chat/normal',
				'<a href="/chat/normal" class="text-sky-600" > Speacial AI chat</a> '
			);
	}

	function extractTextFromStream(stream: string) {
		const regex = /"text":\s*"([^"]*)"/g;
		let match;
		let newText = '';

		while ((match = regex.exec(stream)) !== null) {
			newText += decodeText(match[1]);
		}

		// Append new text to accumulated text instead of overwriting
		accumulatedText += newText;
		//console.log(accumulatedText)
		return accumulatedText;
	}
	let textTorender = $state('');

	let chatError = $state();

	let generateChat = async () => {
		let prompt = value;
		streamDone = false;
		newChat = false;
		chatHistory.push({
			role: 'user',
			parts: [
				{
					text: prompt
				}
			]
		});

		value = '';

		let promptElem = document.createElement('span');
		promptElem.className =
			'bg-bg-chat text-chat h-fit w-[90%] self-end hyphens-auto text-wrap break-words rounded-b-2xl rounded-tl-2xl p-2 text-lg! outline outline-1 outline-stone-600 md:text-xl!';

		promptElem.textContent = prompt;
		newChat = false;
		document.getElementsByClassName('chats')[0].appendChild(promptElem);
		currentSequence += 1;

		window.scrollTo(0, document.body.scrollHeight);

		let responseElement = document.createElement('span');
		responseElement.className =
			'bg-bg-chat text-chat h-fit w-[90%] space-y-3 self-start rounded-b-2xl rounded-tr-2xl p-2 text-lg! outline outline-1 outline-lime-500 md:text-xl! hidden';

		let req = await fetch('/api/generate', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				summary: data.allChats[0].summary?.replaceAll('```html', '').replaceAll('```', ''),
				prompt,
				chatId: data.allChats[0].chatId,
				sequence: currentSequence,
				chatHistory
			})
		});

		if (!req.ok) {
			chatError = true;
			currentSequence -= 1;
			toast.set({
				title: 'Something went wrong',
				description: 'Please try again'
			});

			console.log('CHAT_ERROR:', await req.json());
			return;
		}

		let reader = req.body?.getReader();

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
					.replaceAll('``', '')
					.replaceAll(
						'/chat/normal',
						'<a href="/chat/normal" class="text-sky-600" > Special AI chat</a> '
					);

				responseElement.classList.remove('hidden');
				textTorender += decode;

				responseElement.innerHTML = DOMPurify.sanitize(textTorender);
				window.scrollTo(0, document.body.scrollHeight);

				if (done) {
					chatHistory.push({
						role: 'model',
						parts: [
							{
								text: textTorender
							}
						]
					});
					textTorender = '';
					streamDone = true;
					break;
				}
			} catch (err) {
				toast.set({
					title: 'Something went wrong',
					description: 'Please try again'
				});
			}
		}
	};
</script>

<main class="chatPage mt-[0.5rem] flex min-h-svh w-full flex-col items-center">
	<div
		class="z-2 fixed bottom-0 flex w-full justify-between {theme.theme === 'dark'
			? 'bg-stone-900'
			: 'sm:bg-transparent bg-stone-800'} sm:outline-hidden gap-x-2 sm:border-none border-t-2 border-stone-600 sm:justify-center"
	>
		<textarea
			onkeypress={async (e) => {
				if (!(e.key === 'Enter')) return;
				if (!value || value.length === 0) return;
				if (!streamDone) return;
				generateChat();
			}}
			bind:value
			class="font-generalSans z-2 max-h-[10rem] min-h-[4.5rem] w-[90%] resize-y rounded-none sm:rounded-t-lg bg-stone-900 px-3 py-2 text-stone-300  outline-2 outline-stone-600 sm:w-[90%]"
			placeholder="Type something"
		></textarea>
		<button
			onclick={() => {
				if (!value || value.length === 0) return;
				if (!streamDone) return;
				generateChat();
			}}
			aria-labelledby="Send"
			class="block size-fit mr-1 self-center rounded-full bg-stone-900 p-1 outline-1 outline-stone-700 peer-focus:outline sm:hidden"
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
	<div class="font-satoshi! chatPage text-heading mb-8 mt-[3.75rem] w-[90%] md:w-[85%]">
		{@html data.allChats[0].summary?.replaceAll('```html', '').replaceAll('```', '')}
	</div>
	<div class="font-satoshi chats text-heading mb-[85px] flex w-[90%] flex-col gap-y-4">
		{#if newChat}
			<h1 class="text-heading m-auto">No chats yet!</h1>
		{:else if data.allChats.length > 1}
			{#each data.allChats as x}
				<span
					style:display={x.prompt === 'SUMMARY_OF_THE_DOCUMENT' ? 'none' : 'block'}
					class="text-chat bg-bg-chat text-base! md:text-xl! h-fit w-[95%] self-end hyphens-auto text-wrap break-words rounded-b-2xl rounded-tl-2xl p-2 outline outline-1 outline-stone-600"
				>
					{x.prompt}
				</span>
				<span
					style:display={x.response === 'SAME_AS_SUMMARY' ? 'none' : 'inline-block'}
					class="text-chat font-chillax bg-bg-chat text-base! md:text-xl! h-fit w-[95%] self-start rounded-b-2xl rounded-tr-2xl p-2 outline outline-lime-500"
				>
					{@html x.response}
				</span>
			{/each}
		{/if}
	</div>
</main>

<style>
	@reference "../../../app.css";

	.chatPage :global(h1) {
		@apply !text-2xl md:!text-3xl;
	}
	.chatPage :global(p) {
		@apply mt-2 text-pretty !text-lg font-medium md:!text-xl;
	}
	.chatPage :global(li) {
		@apply !text-base md:!text-lg;
	}
	.chatPage :global(div) {
		@apply font-satoshi! hyphens-auto text-pretty break-words;
	}
</style>
