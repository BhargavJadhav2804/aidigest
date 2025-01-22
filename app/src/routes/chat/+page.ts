import type { PageLoad } from './$types';

export const load = (async () => {
    console.log('page ran!!')
    return {
        message: 'message'
    };
}) satisfies PageLoad;