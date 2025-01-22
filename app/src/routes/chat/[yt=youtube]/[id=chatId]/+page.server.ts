import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {


    let chatId = Number(url.pathname.split('/chat/yt/')[1])


    let allChats = await db.select().from(chats).where(eq(chats.chatId, chatId))


    return {
        allChats
    };
}) satisfies PageServerLoad;