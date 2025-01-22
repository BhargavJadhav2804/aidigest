import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((params: string) => {

    let param = Number(params)
    let MAX_INT = 2147483647

    if (param >= MAX_INT) {
        return false
    } else if (param < MAX_INT) {
        return true
    } else {
        return false
    }

}) satisfies ParamMatcher;