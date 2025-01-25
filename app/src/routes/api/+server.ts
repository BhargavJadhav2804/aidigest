import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from "$lib/server/db"
import { chats, chatsOnDocuments, documents } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm'
import { env } from '$env/dynamic/private';


export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { pageContent, metadata, chatId } = body;
    let req = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: `{"model":"models/text-embedding-004","content":{"parts":[{"text":"${pageContent}"}]},"outputDimensionality":"768"}`
    });
    let response = await req.json()
    let newChatSet = false;
    try {
        //TODO : Improve this logic
        let ifChatCreated = async () => {
            let result = await db.select().from(chats).where(eq(chats.chatId, chatId))
            return result
        }

        let actualChatId: number;


        let res = await ifChatCreated()
        if (res.length === 0) {
            let newChats = await db.insert(chats).values({
                chatId,
                prompt: "SUMMARY_OF_THE_DOCUMENT",
                response: "SAME_AS_SUMMARY",
                userId: 10101,
                sequence: 0
            }).returning({id:chats.id})

            actualChatId = newChats[0].id;
        } else {
            actualChatId = res[0].id;
        }


        let result = await db.insert(documents).values({
            pageText: pageContent,
            embedding: response.embedding.values,
            metaData: metadata,
            chatId
        }).returning({ documentsId: documents.id,chatId:chats.chatId })

        let docsInjoints = await db.insert(chatsOnDocuments).values({
            chatId: actualChatId,
            documentsId: result[0].documentsId
        })

        return json({ result, pageContent });

    } catch (e: any) {
        error(400, { message: e.message })
    }


}