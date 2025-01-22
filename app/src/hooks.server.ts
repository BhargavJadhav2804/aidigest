import type { Handle } from '@sveltejs/kit';

let type = ['font', 'asset', 'css', 'js']
export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        preload(input) {
            return type.includes(input.type)
        },
    });
    return response;
};