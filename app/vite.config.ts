import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [sveltekit(), enhancedImages(),tailwindcss()],
	worker:{
			format:'es'
	}
});
