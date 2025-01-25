import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { error, json, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ url, request }) => {

    // let ifToCreateChat = url.searchParams.get('createYtChat') === null ? false : Number(url.searchParams.get('createYtChat'));

    // if (ifToCreateChat) {
    //     let req = await db.insert(chats).values({
    //         chatId: ifToCreateChat,
    //         prompt: 'FOR THE SYSTEM : Ignore this prompt',
    //         sequence: 0,
    //         response: 'FOR THE SYSTEM : Ignore this response',
    //         userId: 10101
    //     }).returning({ chatId: chats.chatId })

    //     return json({ chatId: req[0].chatId })

    // }


    let body = await request.json()

    let { chatId, ytLink }: { chatId: string, ytLink: string } = body;

    function extractYoutubeId(url: string) {
        const id = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&][^#]*|$)/;

        const match = url.match(id);
        return match ? match[1] : null;
    }

    console.log(ytLink, '\n', chatId, '\n', ytLink.length)

    let ifSummaryAvailable = (await db.select().from(chats).where(eq(chats.chatId, Number(chatId))))?.[0]?.summary


    let system_instructions = [{
        text: "You are an AI youtube videos summarizer and chat assistant, you'll be given the associated data of youtube video, like transcript (if available or else it will be not given), descriptions, title,etc"
    },
    {
        text: "Answer the questions asked by the user in friendly and detailed manner."
    },
    {
        text: "Analyze the user input and provide an valid HTML-formatted response that can be directly rendered or inserted in a div tag. Consider using a conversational tone and employ HTML elements like headings, lists, and code blocks to improve clarity and presentation."
    },
    {
        text: "Do not apply any color or font styles for the html content or elements. Make the list headings or subheadings and any keywords bold. Provide large spacings or sufficient margins between sections, lists, paragraphs and between subsquent paragraphs and headings, maintaining readability or visually appealing reading experience"

    },
    {
        text: "Ensure the validity of generated HTML code, with no invalid HTML tags"
    },
    ]

    let transcript;

    let snippets;
    let id = ytLink.length === 11 ? ytLink : extractYoutubeId(ytLink)

    if (!id) {
        error(400, { message: 'Invalid youtube link' })
    }

    try {
        const loader = YoutubeLoader.createFromUrl(ytLink.length === 11 ? `https://youtube.com/watch?v=${ytLink}` : ytLink, {
            language: "en",
            addVideoInfo: true,

        });

        transcript = (await loader.load())[0].pageContent
    } catch {
        transcript = null

    }

    let videoData = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${env.YT_API_KEY}&part=snippet,id`)

    let res = await videoData.json()


    snippets = res.items[0].snippet

    system_instructions.push({
        text: `VIDEO DATA : description :- ${snippets.description}, title :- ${snippets.title}, id :- ${snippets.id}`
    }, {
        text: `VIDEO TRANSCRIPT : ${transcript ? transcript : 'NOT AVAILABLE FOR THIS VIDEO'}`
    })


    const genAI = new GoogleGenerativeAI(env.API_KEY);
    const model = genAI?.getGenerativeModel({
        model: "gemini-1.5-flash", systemInstruction: {
            parts: system_instructions,
            role: 'model'
        }
    });



    let summary = (await model.generateContent("Create")).response.text()

    let req = await db.insert(chats).values({
        prompt: "THE VIDEO SUMMARY",
        response: "SAME AS SUMMARY",
        summary: summary.replaceAll('```html', '')
            .replaceAll('```', '')
            .replace('html', '')
            .replaceAll('``', '')
            .replaceAll(
                '/chat/normal',
                '<a href="/chat/normal" class="text-sky-600" > Special AI chat</a> '
            ),
        sequence: 0,
        userId: 10101,
        chatId: Number(chatId)
    }).returning({ chatId: chats.chatId })


   // redirect(303, `/chat/yt/${req[0].chatId}`)









    // let stream = new ReadableStream({
    //     start(controller) {
    //         return pump()
    //         async function pump() {
    //             for await (const chunk of response.stream) {
    //                 let chunkText = chunk.text()
    //                 chunked += chunkText
    //                 controller.enqueue(chunkText)

    //             }
    //             controller.close()

    //             let insertChats = await db.insert(chats).values({
    //                 prompt: userPrompt,
    //                 response: chunked.replaceAll('```html', '')
    //                     .replaceAll('```', '')
    //                     .replace('html', '')
    //                     .replaceAll('``', ''),
    //                 userId: 10101,
    //                 sequence,
    //                 chatId
    //             })
    //         }

    //     },
    //     cancel() {

    //     }
    // })

    return json({snippets,transcript})

};
