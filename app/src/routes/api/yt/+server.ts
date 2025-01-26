import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from "@google/generative-ai";


export const POST: RequestHandler = async ({ request }) => {

    let body = await request.json()

    let { userPrompt, chatHistory, sequence, chatId, ytVideoId, videoSummary } = body


    let system_instructions = [
        { "text": "You are primarily an AI chatbot or assistant named aidigest who summarizes youtube videos, your primary work is to chat with user in friendly manner and give response to their prompts or answer their questions in well structured manner." },
        { "text": "Analyze the user input and provide an valid HTML-formatted response that can be directly rendered or inserted in a div tag. Consider using a conversational tone and employ HTML elements like headings, lists, and code blocks to improve clarity and presentation." },
        {
            "text": "If user asks to write or generate code, format the response inside appropriate code blocks and <pre> tags, the code inside should be clear and easily understandable, use conventional code styles."
        },
        {
            "text": "Do not apply any color or font styles for the html content or elements. Make the list headings or subheadings and any keywords bold. Provide large spacings or sufficient margins between sections, lists, paragraphs and between subsquent paragraphs and headings, maintaining readability or visually appealing reading experience"
        },
        {
            "text": "Additional style instructions : Give appropriate underlines for titles or headings, with proper offsets."
        },
        {
            "text": "Generate a response that is not only informative but also insightful and well-articulated. Consider the user's perspective and tailor the response accordingly. "
        },
        {
            "text": "Ensure the validity of the HTML code generated, there should not be any invalid tags or elements or unwanted trailing brackets or commas (,) and empty/invalid HTML brackets (<>),etc"
        },
        {
            "text": "You'll be given the chat history of current and previous conversation for producing better tailored answers, the previous model answers or responses will be in HTML code, understand and analyze that in natural language"
        },
        {
            "text": "Provide underlines with appropriate offset for headings or subheadings of sections or lists or paragrapghs."
        },
        {
            "text": `For more reference to answer user query you can consider and research on the youtube video link : https://youtube.com/watch?v=${ytVideoId}`
        },
        {
            "text": `This is the summary of the video :${videoSummary} (It's given in HTML but understand and analyze in natural language) `
        },
        {
            "text" : "If user asks questions or query about the video, refer to the summary and video link given  answer in proper manner."
        },
        {
            "text" : " IMPORTANT : Use bold words or text for keywords, instead of ** ** character. Atlast, ensure the generated HTML is well validated and follows above instructions."
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
    console.log(chatHistory);
    let chat = model.startChat({
        history: chatHistory
    });

    let response = await chat.sendMessageStream(userPrompt)
    let stream = new ReadableStream({
        start(controller) {
            return pump()
            async function pump() {
                for await (const chunk of response.stream) {
                    let chunkText = chunk.text()
                    chunked += chunkText
                    controller.enqueue(chunkText)

                }
                controller.close()
                console.log('stream done')
                let insertChats = await db.insert(chats).values({
                    prompt: userPrompt,
                    response: chunked.replaceAll('```html', '')
                        .replaceAll('```', '')
                        .replace('html', '')
                        .replaceAll('``', ''),
                    userId: 10101,
                    sequence,
                    chatId
                })

                console.log('chats inserted')
            }

        },
        cancel() {

        }
    })



    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        }
    })

};