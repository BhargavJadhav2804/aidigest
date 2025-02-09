import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sys_instructions, ytChatSysInstructions } from '$lib/server/db/sysInstructions';


export const POST: RequestHandler = async ({ request }) => {

    let body = await request.json()

    let { userPrompt, chatHistory, sequence, chatId, ytVideoId, videoSummary } = body


    let system_instructions = [
        ytChatSysInstructions,
        {
            text: `VIDEO SUMMARY : ${videoSummary}`
        },
        {
            text: `VIDEO ID : ${ytVideoId}`
        }
    ]

    const genAI = new GoogleGenerativeAI(env.API_KEY);
    const model = genAI?.getGenerativeModel({
        model: "gemini-1.5-flash", systemInstruction: {
            parts: system_instructions,
            role: 'model'
        }
    });

    let chunked = ''

    let chat = model.startChat({
        history: chatHistory
    });

    const abortController = new AbortController();

    let response = await chat.sendMessageStream(userPrompt, {
        signal: abortController.signal
    })

    let controllerClosed = false;
    let faultyResponse = 0
    let stream = new ReadableStream({
        async pull(controller) {
            try {
                for await (const chunk of response.stream) {
                    if (faultyResponse >= 3) {
                        console.log('closing due to faulty response')
                        controller.close()
                        controllerClosed = true;
                        break;
                    }

                    let chunkText = chunk.text()
                    chunked += chunkText
                    controller.enqueue(chunkText);

                    if (chunkText.length === 96) {
                        faultyResponse += 1
                    } else {
                        faultyResponse = 0
                    }

                    console.log("IN THE LOOP \n")
                }
                console.log("OUTSIDE THE LOOP \n")

                if (!controllerClosed && !abortController.signal.aborted) {
                    controller.close()
                    controllerClosed = true
                }

            } catch (streamError) {
                console.error('Stream error:', streamError);
                controller.error(streamError); // Propagate error to client
                if (!abortController.signal.aborted && !controllerClosed) {
                    abortController.abort()
                    error(500, { message: "Stream error occured" })
                }
            } finally {
                console.log('STREAM DONE \n')

                if (!abortController.signal.aborted && controllerClosed) {
                    try {
                        let insertChats = await db.insert(chats).values({
                            prompt: userPrompt,
                            response: chunked.replaceAll('```html', '')
                                .replaceAll('```', '')
                                .replace('html', '')
                                .replaceAll('``', '')
                                .replaceAll(/\*\*([^*]+)\*\*/g, '<b>$1</b>'),

                            userId: 10101,
                            sequence,
                            chatId
                        })
                    } catch (dbError: any) {
                        console.error('Database error:', dbError);
                        error(400, { message: dbError.message ?? dbError.msg })
                    }
                }
                console.log('CHATS INSERTED \n')

            }


        },
        cancel() {
            console.log('Stream cancelled by client');
            abortController.abort();
            error(500, { message: "Stream cancelled by client" })

        }
    })



    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        }
    })

};