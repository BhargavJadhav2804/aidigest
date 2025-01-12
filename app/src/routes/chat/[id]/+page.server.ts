import type { PageServerLoad } from './$types';
import { db } from "$lib/server/db"
import { and, eq } from 'drizzle-orm';
import { chats, documents } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { cosineDistance } from 'drizzle-orm';



export const load = (async ({ url, fetch }) => {

    let toGenerateSummray = url.searchParams.get('summary') ===''

    let generatedSummray = null
    let chatid = Number(url.pathname.split('/chat/')[1])



    if (toGenerateSummray) {
        try {
            let getEmbeddings = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=AIzaSyDlLe0wUcEIF6TEOyTWvshCEqT0PgNG2bY', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: `{
                    "model": "models/text-embedding-004",
                    "content": {
                      "parts": [
                        {
                          "text": "What is the summary of the data? Or What are the essential data and text contained in the document? Or What are the contents of the document?"
                        }
                      ]
                    },
                    "outputDimensionality": "768"
                  }`

            })


            let embeddings = (await getEmbeddings.json()).embedding.values as number[]

            let vectorSearch = await db.select({ distance: cosineDistance(documents.embedding, embeddings), pageText: documents.pageText }).from(documents).orderBy(cosineDistance(documents.embedding, embeddings)).limit(50).where(eq(documents.chatId, chatid))





            let generate = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDlLe0wUcEIF6TEOyTWvshCEqT0PgNG2bY', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: "You are an AI summarizer named aidigest, you'll be given a set of data or text which is extracted from a document (it was extracted by vector search performed on the document, it may also contain some meta data related to the document such as cosine distance)."
                        },{
                            text:"Firstly, generate a accurate and detailed or long summary based on the data or text given, you can structure it pointwise if required and then answer any questions that are asked by user asked."
                        },{
                            text: "Generate the response in suitable format that can be directly rendered in a span tag in html, with proper styles such as padding or margin for pretty readable text"
                        },{
                            text: "Additional style instructions : add styles directly in their tag, dont add any fonts and border or outlines, dont add any background color in parent or children elements, add sufficient margins or spaces in subsequent elements such as li or h1 or any type of different elements which should be associated differently, make sure the styles are responsive as well for mobile devices, always style the title elements or any other important titles bigger in size, make the font size appropriate and responsive for different devices like mobile, laptops, etc and make font size large enoguh for different elements so that it is readable, make sure they aren't very large considering the device size, add padding of 0.5rem and margin of 0.2rem on parent element, add a simple single dashed and appropriate underline with offset for summary title "
                        },{
                            text : "You can use appropriate emojis or icons but only if necessary, make sure they are placed correctly and dont cause any layout issues."
                        },{
                            text : "Follow this order of size for structuring or sizing the fonts for elements  (in descending order) : h1 > li > p > h2   "
                        }]
                    },
                    contents: {
                        parts: [{
                            text: JSON.stringify(vectorSearch)
                        },{
                            text: 'What is the summary of the document? What are the main outcomens and overview of it? State indetailed summary without losing any information but keep it concise'
                        }]
                    }
                })
            })

            let generated = await generate.json()
             console.log(generated)
            generatedSummray = generated

        }

        catch (e: any) {
            console.log(e)
            error(400, { message: e.message })
        }
    }

    let allChats = await db.query.chats.findMany({
        where: and(eq(chats.chatId, chatid), eq(chats.userId, 1000))
    })
    console.log(chatid)
    return {
        allChats,
        generatedSummray
    };
}) satisfies PageServerLoad;