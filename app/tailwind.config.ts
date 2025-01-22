import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily:{
				'chillax':['chillax','sans-serif'],
				'generalSans':['generalSans','sans-serif'],
				'satoshi':['satoshi','sans-serif']
			},
			colors:{
				'heading':"var(--text-heading)",
				'chat' : "var(--text-chat)",
				'bg-chat': "var(--bg-chat)"
			}
		}
	},

	plugins: []
} satisfies Config;
