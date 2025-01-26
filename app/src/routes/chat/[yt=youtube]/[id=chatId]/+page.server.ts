import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ url }) => {


    let chatId = Number(url.pathname.split('/chat/yt/')[1])


    let allChats = await db.select().from(chats).where(eq(chats.chatId, chatId))
    
    if (allChats.length === 0) {
        error(404, { message: "Chat doesn't exist" })
    }

    return {
        allChats
    };
}) satisfies PageServerLoad;