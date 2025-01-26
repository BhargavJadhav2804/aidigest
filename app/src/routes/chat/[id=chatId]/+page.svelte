<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	import DOMPurify from 'dompurify';

	let value: string | undefined = $state();

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

	$inspect(data.allChats, '\n', currentSequence, '\n', chatHistory);

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
</script>

<main class="chatPage mt-[0.5rem] flex min-h-svh w-full flex-col items-center">
	<div class="fixed bottom-0 flex w-full justify-center">
		<textarea
			onkeypress={async (e) => {
				if (!(e.key === 'Enter')) return;
				if (!value) return;

				let prompt = value;

				chatHistory.push({
					role: 'user',
					parts: [
						{
							text: prompt
						}
					]
				});

				value = '';

				let promptElem = document.createElement('div');
				promptElem.className =
					'bg-bg-chat text-chat h-fit w-[90%] self-end hyphens-auto text-wrap break-words rounded-b-2xl rounded-tl-2xl p-2 text-lg! outline outline-1 outline-stone-600 md:text-xl!';

				promptElem.textContent = prompt;
				newChat = false;
				document.getElementsByClassName('chats')[0].appendChild(promptElem);
				currentSequence += 1;

				window.scrollTo(0, document.body.scrollHeight);

				let responseElement = document.createElement('div');
				responseElement.className =
					'bg-bg-chat text-chat h-fit w-[90%] self-start rounded-b-2xl rounded-tr-2xl p-2 text-lg! outline outline-1 outline-lime-500 md:text-xl! hidden';

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
					return;
				}

				let reader = req.body?.getReader();

				document.getElementsByClassName('chats')[0].appendChild(responseElement);

				while (true) {
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
						break;
					}
				}
			}}
			bind:value
			class="font-generalSans z-2 max-h-[10rem] min-h-[4.5rem] w-[90%] resize-y rounded-t-lg bg-stone-900 px-3 py-2 text-stone-300 outline outline-2 outline-stone-600 sm:w-[90%]"
			placeholder="Type something"
		></textarea>
	</div>
	<div class="font-satoshi! chatPage text-heading mb-8 mt-[3.75rem] w-[90%] md:w-[85%]">
		{@html data.allChats[0].summary?.replaceAll('```html', '').replaceAll('```', '')}
	</div>
	<div class="font-satoshi chats text-heading mb-[85px] flex w-[90%] flex-col gap-y-4">
		{#if data.allChats.length === 1 || newChat}
			<h1 class="text-heading m-auto">No chats yet!</h1>
		{:else if data.allChats.length > 1}
			{#each data.allChats as x}
				<span
					style:display={x.prompt === 'SUMMARY_OF_THE_DOCUMENT' ? 'none' : 'block'}
					class="text-chat bg-bg-chat h-fit w-[95%] self-end hyphens-auto text-wrap break-words rounded-b-2xl rounded-tl-2xl p-2 text-base! outline outline-1 outline-stone-600 md:text-xl!"
				>
					{x.prompt}
				</span>
				<span
					style:display={x.response === 'SAME_AS_SUMMARY' ? 'none' : 'block'}
					class="text-chat bg-bg-chat h-fit w-[95%] self-start rounded-b-2xl rounded-tr-2xl p-2 text-base! outline outline-1 outline-lime-500 md:text-xl!"
				>
					{@html x.response}
				</span>
			{/each}
		{/if}
	</div>
</main>

<style scoped>
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
		@apply hyphens-auto text-pretty break-words;
	}
</style>
