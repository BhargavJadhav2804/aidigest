<script lang="ts">
	import BG_SHAPES from '$lib/components/bg.svelte';
</script>


<BG_SHAPES />
<div class="bg-gradient absolute z-0 h-svh w-full"></div>
<main class="flex min-h-svh w-full flex-col items-center justify-center">
	<section class="text-heading z-2 flex h-svh w-full items-center justify-center">
		<div class="flex h-[75%] w-[90%] flex-col items-center justify-evenly">
			<h1
				class="tagline decoration-3 text-center text-[1.65rem] underline decoration-cyan-500 decoration-wavy underline-offset-4 [font-family:'Chillax',sans-serif;]
md:text-5xl"
			>
				Intelligent summaries, redefined
			</h1>
			<div class="info flex flex-col items-center gap-y-6">
				<span
					class=" w-[85%] text-center text-lg leading-7 font-satoshi md:text-2xl md:leading-8"
				>
					Tired of spending hours on documents and videos? AI Digest uses powerful AI technology to
					instantly provide clear, concise summaries, and lets you ask questions and chat with the
					content, benefiting students, researchers, and anyone who wants to stay informed.
				</span>
				<a href="/chat" class="contents">
					<button
						class="max-w-fit rounded-xl border-none bg-cyan-400 p-3 text-xl text-stone-800 font-generalSans"
					>
						Get started
					</button>
				</a>
			</div>
		</div>
	</section>
	
	<section class="section-gradient text-heading z-1 items-center flex min-h-svh w-full flex-col gap-y-12">
		<div class="flex sm:gap-x-4 h-svh w-full flex-col sm:items-stretch items-center justify-evenly gap-y-1 p-2 sm:flex-row">
			<span
				class="z-2 flex w-full flex-col font-chillax sm:h-full sm:w-1/2 sm:flex-row sm:items-center sm:justify-center"
			>
				<p class=" -blue-500 w-full text-2xl sm:text-3xl">
					Condense information effortlessly! Our AI summarizes PDFs and YouTube videos, delivering
					key insights quickly and easily.
				</p>
			</span>
			<enhanced:img
				src="/static/chat_depiction.jpg"
				class="block aspect-square size-[315px] rounded-xl sm:sticky sm:top-16 sm:size-[435px] md:size-[450px]"
				alt="An alt text"
			/>
		</div>
		<div class="flex sm:gap-x-4 h-svh w-full flex-col sm:items-stretch items-center justify-evenly gap-y-1 p-2 sm:flex-row-reverse">
			<span
				class=" -gray-800 flex w-full flex-col font-chillax sm:h-full sm:w-1/2 sm:flex-row sm:items-center sm:justify-center"
			>
				<p class=" -blue-500 w-full text-2xl sm:text-3xl">
					Save time and boost your learning. AI Digest provides accurate summaries of PDFs and
					YouTube videos, helping you grasp key concepts faster. Not just that, you can chat with
					your data, as normally you would!
				</p>
			</span>
			<enhanced:img
				src="/static/man_with_phone.jpg"
				class="block aspect-square size-[315px] rounded-xl sm:sticky sm:top-16 sm:size-[435px] md:[450px]"
				alt="An alt text"
			/>
		</div>
		<div class="flex h-[30svh] w-full flex-col items-center justify-center gap-y-4 sm:h-[35svh]">
			<span class=" font-['Chillax',sans-serif;] text-2xl sm:text-3xl"> Try it now! </span>
			<a class="contents" href="/chat">
				<button
					class="max-w-fit text-stone-800 rounded-xl border-none bg-cyan-400 p-3 text-lg font-generalSans sm:text-xl"
				>
					Get started
				</button>
			</a>
		</div>
	</section>
</main>

<style>
	:global(html[data-theme='light']) .bg-gradient {
		background: rgb(224, 231, 255);
		background: linear-gradient(117deg, rgba(224, 231, 255, 1) 26%, rgba(207, 250, 254, 1) 71%);
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 250ms;
	}
	:global(html[data-theme='light']) .section-gradient {
		background: rgb(224, 231, 255);
		background: linear-gradient(317deg, rgba(224, 231, 255, 1) 26%, rgba(207, 250, 254, 1) 71%);
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 250ms;
	}
</style>
