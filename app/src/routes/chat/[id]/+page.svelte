<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	console.log(data.generatedSummray?.candidates[0].content.parts[0].text);
</script>
<svelte:head>
	<link
		href="https://api.fontshare.com/v2/css?f[]=satoshi@400&f[]=general-sans@400&f[]=chillax@400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
<div class="text-stone-900 !font-satoshi w-[90%] md:w-[75%] m-auto">
	{@html data.generatedSummray?.candidates[0].content.parts[0].text}
</div>
