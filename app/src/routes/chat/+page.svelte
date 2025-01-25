<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { sleep, toast } from '$lib';
	import { Tween } from 'svelte/motion';
	import WORKER from "$lib/worker?worker"

	import { createDialog, createProgress, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { expoInOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import HowItWorks from '$lib/components/HowItWorks.svelte';

	type result = {
		id: number;
		chatId: number;
		createdAt: Date;
		updatedAt: Date;
		pageText: string;
		embedding: number[];
		metaData: unknown;
	}[];

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog({
		openFocus: '.dialog-elem'
	});
	let tween = new Tween(0, {
		duration: 150,
		easing: expoInOut
	});
	const {
		elements: { root },
		options: { max },
		states: { value }
	} = createProgress({
		max: 100
	});

	let { data }: { data: PageData } = $props();
	let worker: Worker | undefined = undefined;

	let userFiles: null | FileList = $state(null);

	onMount(() => {
		worker = new WORKER();
	});

	let fileExtracting = $state(false);
	let fileExtracted = $state(false);

	let totalPages: null | number = $state(null);
	let documentFile: null | Array<Record<string, any>> = $state(null);

	let fileProcessed = $state(false);
	let fileProcessing = $state(false);

	let ytLink = $state('');

	let processedResult: undefined | any[] = $state([]);

	let generatingSummary = $state.raw(false);

	let file = $derived.by(() => {
		if (userFiles) {
			return userFiles[0];
		} else {
			return null;
		}
	});
	function generateRandom4ByteInteger() {
		const buffer = new Uint32Array(1);
		// Maximum value for a 4-byte signed integer (2^31 - 1)
		const MAX_INT32 = 2147483647;
		// Minimum value for a 4-byte signed integer (-2^31)
		crypto.getRandomValues(buffer);
		const randomInteger = buffer[0] % (MAX_INT32 + 1);
		return randomInteger;
	}
	console.log(generateRandom4ByteInteger());
	let extractFile = async () => {
		if (!worker || !file) return;

		if (file.size / 5000000 >= 10) {
			toast.set({
				title: 'Error!',
				description: 'File over 50MB are not accepted',
				color: 'red'
			});
		} else {
			fileExtracting = true;
			worker?.postMessage({ file });
			worker.onmessage = async (e) => {
				console.log(e.data);
				if (e.data.processDone === true) {
					fileExtracting = false;
					totalPages = e.data.totalPages as number;
					documentFile = e.data.document;
					fileExtracted = true;
				} else if (e.data.processDone === false) {
					fileExtracting = false;
					toast.set({
						title: 'Invalid PDF ',
						description: 'PDF files made with scanned images are not accepted',
						color: 'error'
					});
				}
			};
		}
	};

	let processFile = async () => {
		if (!documentFile) return;
		fileProcessing = true;
		value.set(0);
		tween.set(0);
		let documentLength = documentFile.length;
		let uniqueId = generateRandom4ByteInteger();

		for (let i = 0; i < documentLength; i++) {
			let req = await fetch(`/api`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pageContent: documentFile[i].pageContent.replaceAll('\u0000', ''),
					metadata: documentFile[i].metadata.loc,
					chatId: uniqueId
				})
			});

			let res = await req.json();
			tween.set(i === 0 ? 1 : (i / (documentLength - 1)) * 100);
			console.log(tween.target);
			value.set(tween.target);

			processedResult?.push(res.result);
			console.log(res);
		}
		value.set(100);
		fileProcessing = false;
		fileProcessed = true;
	};

	$inspect({ userFiles, documentFile });

	$inspect('RESULT', processedResult[0]);

	$inspect(ytLink);
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div class="fixed inset-0 z-[2] bg-black/50" use:melt={$overlay} />
		<div
			transition:fly={{ duration: 250, y: '25px' }}
			use:melt={$content}
			class="dialog-elem fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[90vw]
            max-w-[450px] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-4 rounded-xl bg-sky-200 p-3 focus:outline-none"
		>
			<div class="space-y-2">
				<h1 use:melt={$title} class="font-['Satoshi',sans-serif] text-lg text-stone-900 sm:text-xl">
					Upload a pdf file
				</h1>
				<span
					use:melt={$description}
					class="flex items-center gap-x-1 font-['Satoshi',sans-serif] text-base text-stone-900 sm:text-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="19"
						height="19"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-circle-alert mt-[0.3rem] size-[15px] shrink-0 self-start sm:mt-[0.35rem] sm:size-[18px]"
						><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line
							x1="12"
							x2="12.01"
							y1="16"
							y2="16"
						/></svg
					>
					<p>Please note that scanned files or pdf made with scanned images are not allowed.</p>
				</span>
				{#if userFiles}
					<div
						class="flex w-fit justify-around gap-x-6 rounded-lg p-2 outline outline-2 outline-lime-600"
					>
						<div class="flex flex-col gap-y-1">
							<h1 class="font-['Satoshi',sans-serif] italic text-stone-900">
								{userFiles[0].name.length <= 20
									? userFiles[0].name
									: `${userFiles[0].name.slice(0, 20)}...`}
							</h1>

							{#if totalPages}
								<h1 class="font-['Satoshi',sans-serif] italic text-stone-900">
									Total number of pages : {totalPages}
								</h1>
							{/if}
						</div>
						<button
							onclick={() => {
								userFiles = null;
								documentFile = null;
								fileExtracted = false;
								fileProcessed = false;
								value.set(0);
							}}
							aria-label="Clear files"
						>
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
								class="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
							>
						</button>
					</div>
				{/if}
				{#if fileProcessing}
					<div
						use:melt={$root}
						class="relative h-3 w-full overflow-hidden rounded-[99999px] border border-cyan-700 bg-cyan-200"
					>
						<div
							class="h-full w-full bg-cyan-500 transition-transform duration-[660ms]
	ease-[cubic-bezier(0.65,0,0.35,1)]"
							style={`transform: translateX(-${100 - (100 * ($value ?? 0)) / ($max ?? 1)}%)`}
						></div>
					</div>
				{/if}
				<div class="flex {userFiles ? 'flex-col' : 'flex-row'} w-full justify-between gap-y-2">
					<input
						type="file"
						name="file-input"
						class="hidden"
						bind:files={userFiles}
						id="file-input"
					/>
					{#if !userFiles}
						<label
							for="file-input"
							class="cursor-pointer rounded-xl bg-cyan-500 p-2 text-center font-['Satoshi',sans-serif] text-lg text-stone-900"
						>
							Upload
						</label>
					{:else if fileExtracted && documentFile && !fileProcessed}
						<button
							disabled={fileProcessing}
							onclick={processFile}
							class="rounded-xl bg-cyan-500 p-2 font-['Satoshi',sans-serif] text-lg text-stone-900"
						>
							{fileProcessing ? 'Processing please wait' : 'Process the file'}
						</button>
					{:else if !fileExtracted && !documentFile}
						<button
							disabled={fileExtracting}
							onclick={extractFile}
							class="rounded-xl bg-cyan-500 p-2 font-['Satoshi',sans-serif] text-lg text-stone-900"
						>
							{fileExtracting
								? 'Extracting text please wait, this may take a while depending on your file size'
								: 'Proceed'}
						</button>
					{:else if fileExtracted && fileProcessed}
						<button
							disabled={generatingSummary}
							onclick={async () => {
								generatingSummary = true;
								await goto(
									`/chat/${processedResult?.length !== 0 ? processedResult[0]?.[0].chatId : '00000'}?summary`
								);
								generatingSummary = false;
							}}
							class="flex items-center justify-between rounded-xl bg-cyan-500 p-2 font-['Satoshi',sans-serif] text-lg text-stone-900 transition-all"
						>
							Done! Generate summary and start chatting
							{#if generatingSummary}
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
									class="lucide lucide-loader-circle shrink-0 animate-spin"
									><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
								>
							{/if}
						</button>
					{/if}
					<button
						use:melt={$close}
						class="rounded-xl bg-cyan-500 p-2 font-['Satoshi',sans-serif] text-lg text-stone-900"
					>
						Cancel
					</button>
				</div>
			</div>
			<b class=" font-chillax m-auto text-lg">OR</b>
			<div class="flex flex-col gap-y-2">
				<input
					bind:value={
						() => ytLink,
						(v) => {
							if (v?.length === 11) {
								ytLink = `https://youtube.com/watch?v=${v}`;
							} else if (v.length !== 11) {
								ytLink = v;
							}
						}
					}
					type="text"
					placeholder="Paste a youtube link or video ID"
					class="font-satoshi w-full rounded-lg bg-stone-800 p-2 text-stone-300 outline-none"
				/>
				<button
					onclick={async () => {
						let chatId = generateRandom4ByteInteger();
						let req = await fetch(`/chat/yt`, {
							method: 'POST',
							body: JSON.stringify({
								ytLink,
								chatId
							})
						});

						await goto(`/chat/yt/${chatId}`)
					}}
					class="w-full cursor-pointer self-center rounded-xl bg-cyan-500 p-2 text-center font-['Satoshi',sans-serif] text-lg text-stone-900"
				>
					Proceed
				</button>
			</div>
			<b class=" font-chillax m-auto text-lg">OR</b>
			<button
				onclick={async () => {
					let req = await fetch(`/chat/normal?createChat=${generateRandom4ByteInteger()}`, {
						method: 'POST'
					});
					let res = await req.json();

					if (!req.ok) return;
					goto(`/chat/normal/${res.chatId}`);
				}}
				class="cursor-pointer rounded-xl bg-cyan-500 p-2 text-center font-['Satoshi',sans-serif] text-lg text-stone-900"
			>
				Start a normal AI chat!
			</button>
		</div>
	</div>
{/if}

<main class="min-h-svh w-full">
	<div class="flex min-h-svh w-full justify-center">
		<div class="mt-[4.35rem] flex min-h-full w-[90%] flex-col sm:w-[75%]">
			<div class="flex w-full flex-col items-center">
				<input
					placeholder="Search for your chats"
					type="text"
					class=" font-satoshi mt-2 w-full rounded-lg bg-stone-800 p-3 text-stone-300 outline outline-1 outline-stone-600"
				/>

				<div class="self-start">
					<ul class="font-satoshi">
						<li class="text-heading text-xl">No chats yet! Create one below</li>
					</ul>
				</div>
			</div>

			<div class="flex h-full items-center justify-center">
				<button
					use:melt={$trigger}
					class="font-generalSans cursor-pointer self-center rounded-xl bg-sky-500 p-3 text-lg sm:text-xl"
				>
					Start a new chat <b class="text-xl">+</b>
				</button>
			</div>
		</div>
	</div>
	<!-- <HowItWorks /> -->
</main>

<style>
</style>
