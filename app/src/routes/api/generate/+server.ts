import type { RequestHandler } from './$types';
import { API_KEY } from "$env/static/private"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';



export const POST: RequestHandler = async ({ request }) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    let body = await request.json()

    const { summary, prompt, chatHistory, sequence, chatId } = body

    const instParts = [
        {
            text: "You are an AI named aidigest, you typically work as an AI summarizer, but just not limited to it, users will send you any messages or ask questions, answer accordingly, if you don't understand anything or can't give any response kindly say so."
        },
        {

            text: "Generate the text as valid HTML code, that can be directly inserted and rendered in a div tag, ensure the validity of it. Also, use li tags for lists or subheadings or other contexts as you may find useful, make the li headings or subheadings bold for clear readability and clean structure. Provide large spacings or gap between li elements or tags and between subsequent paragraphs or p tags. Use b (bold) or i (italic) tags for keywords or important words in the response, rather than using words inside of * *. Prefer structuring the answer in points and lists rather than long paragraphs. "
        },
        {
            text: 'User may ask you questions or send messages in any other language than english, reply in the same language and manner.'
        },
        {
            text: "For summarizing or answer as an AI summarizer you'll be given a generated summary of the documents provided by user. (The summary will be given as a HTML code, understand it as normal pdf document, analyze it and answer accordingly)  "
        },
        {
            text: `SUMMARY OF THE DOCUMENT PROVIDED BY THE USER : ${summary}`
        },
        {
            text: 'If the user tries to go off topic or asks something not related to the document or context, kindly give them hint or try to say them to go to the /chat/noraml page for an AI chat'
        }
    ]

    const model = genAI?.getGenerativeModel({
        model: "gemini-1.5-flash", systemInstruction: {
            parts: instParts,
            role: 'model'
        }
    });

    // let generate = await fetch(
    //`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`,
    //     {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             system_instruction: {
    //                 parts: [
    //                     {
    //                         text: "You are an AI named aidigest, you typically work as an AI summarizer, but just not limited to it, users will send you any messages or ask questions, answer accordingly, if you don't understand anything or can't give any response kindly say so."
    //                     },
    //                     {

    //                         text: "Generate the text as valid HTML code, that can be directly inserted and rendered in a div tag, ensure the validity and consider the escape and new line characters, such that json parsing won't break"
    //                     },
    //                     {
    //                         text: 'User may ask you questions or send messages in any other language than english, reply in same manner and language.'
    //                     },
    //                     {
    //                         text: "For summarizing or answer as an AI summarizer you'll be given a generated summary of the documents provided by user. (The summary will be given as a HTML code, understand it, analyze it and answer accordingly)  "
    //                     },
    //                     {
    //                         text: `SUMMARY OF THE DOCUMENT PROVIDED BY THE USER : ${summary}`
    //                     },
    //                     {
    //                         text: 'Lastly, if the user tries to go off topic or asks something not related to the document or context, kindly give them hint or try to say them to go to the /chat/noraml page for an AI chat'
    //                     }
    //                 ]
    //             },
    //             contents: [
    //                 {
    //                     role: 'user',
    //                     parts: [
    //                         {
    //                             text: prompt
    //                         }
    //                     ]
    //                 }
    //             ],
    //             "generationConfig": {
    //                 "response_mime_type": "application/json"
    //             }

    //         })
    //     }
    // );

    // let reader = generate?.body?.getReader()

    const chat = model.startChat({
        history: chatHistory
    })

    let result = await chat.sendMessageStream(prompt)
    let chunked = ''
    let stream = new ReadableStream({
        start(controller) {
            return pump();
            async function pump() {
                // return reader?.read().then(({ done, value }) => {
                //     // When no more data needs to be consumed, close the stream
                //     if (done) {
                //         controller.close();
                //         return;
                //     }
                //     // Enqueue the next data chunk into our target stream
                //     controller.enqueue(value);
                //     return pump();
                // });
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    chunked += chunkText
                    controller.enqueue(chunkText);
                }
                controller.close()

                let insertChats = await db.insert(chats).values({
                    prompt,
                    sequence,
                    response: chunked.replaceAll('```html', '')
                        .replaceAll('```', '')
                        .replace('html', '')
                        .replaceAll('``', '')
                        .replaceAll(
                            '/chat/normal',
                            '<a href="/chat/normal" class="text-sky-600" > Special AI chat</a> '
                        ),
                    chatId,
                    userId: 10101
                })
            }
        },
        cancel() {

        },
    })

    console.log('stream done!')

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        }

    });
};