import type { PageServerLoad } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';


export const prerender = true

export const config: Config = {
    runtime: 'edge'
}

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;