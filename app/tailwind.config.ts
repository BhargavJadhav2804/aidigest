import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily:{
				'chillax':['Chillax','sans-serif'],
				'generalSans':['General Sans','sans-serif'],
				'satoshi':['Satoshi','sans-serif']
			}
		}
	},

	plugins: []
} satisfies Config;
