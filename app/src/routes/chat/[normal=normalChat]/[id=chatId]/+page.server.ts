import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ url }) => {
    let chatid = Number(url.pathname.split('/chat/normal/')[1])

    let allChats = await db.query.chats.findMany({
        where: and(eq(chats.chatId, chatid), eq(chats.userId, 10101)),
        orderBy: asc(chats.sequence)

    })

    if (allChats.length === 0) {
        error(404, { message: "Chat doesn't exist" })
    }

    return {

        allChats


    };
}) satisfies PageServerLoad;