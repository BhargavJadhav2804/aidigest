// place files you want to import through the `$lib` alias in this folder.

import { writable } from "svelte/store"

export let sleep = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('done')
        }, ms)
    })
}
export const toast = writable<{ title: string, description: string, color?: string } | null>(null)
let to: NodeJS.Timeout;

toast.subscribe((value) => {
    clearTimeout(to)
    if (value !== null) {
        to = setTimeout(() => {
            toast.set(null)
        }, 60000)
    }
})

