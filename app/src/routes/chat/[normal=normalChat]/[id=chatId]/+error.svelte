<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="h-svh w-full flex items-center justify-center">
	<h1 class="text-heading">{page.status}: {page.error?.message}</h1>
</main>
