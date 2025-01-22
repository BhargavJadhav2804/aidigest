import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((params: string) => {
    if (params !== 'yt') {
        return false
    } else {
        return true
    }

}) satisfies ParamMatcher;