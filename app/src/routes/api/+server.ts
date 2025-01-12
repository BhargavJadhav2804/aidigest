import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from "$lib/server/db"
import { allChats, chats, documents } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm'


export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { pageContent, metadata, chatId } = body;
    let req = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=AIzaSyDlLe0wUcEIF6TEOyTWvshCEqT0PgNG2bY', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: `{"model":"models/text-embedding-004","content":{"parts":[{"text":"${pageContent}"}]},"outputDimensionality":"768"}`
    });
    let res = await req.json()
    try {

        let ifChatCreated = async () => {
            let result = await db.select().from(allChats).where(eq(allChats.chatId, chatId))
            return result
        }

        let res = await ifChatCreated()
        if (res.length === 0) {
            let newChats = await db.insert(allChats).values({
                chatId,
                createdBy: '1000'

            })
        }
    } catch (e) {
        console.log('something went wrong : ', e)
    }


    try {
        let result = await db.insert(documents).values({
            pageText: pageContent,
            embedding: res.embedding.values,
            metaData: metadata,
            chatId
        }).returning()
        return json({ result, pageContent });

    } catch (e: any) {
        error(400, { message: e.message })
    }


}