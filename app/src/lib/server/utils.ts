import { cosineDistance,eq } from "drizzle-orm"
import { db } from "./db"
import { documents } from "./db/schema"
import { error } from '@sveltejs/kit';


export type fetchType = typeof fetch

export const generateSummary = async (Fetch: fetchType,chatid: number) => {
    try {
        let getEmbeddings = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=AIzaSyDlLe0wUcEIF6TEOyTWvshCEqT0PgNG2bY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: `{
                "model": "models/text-embedding-004",
                "content": {
                  "parts": [
                    {
                      "text": "What is the summary of the data? Or What are the essential data and text contained in the document? What are the contents of the document?"
                    }
                  ]
                },
                "outputDimensionality": "768"
              }`

        })


        let embeddings = (await getEmbeddings.json()).embedding.values as number[]

        let vectorSearch = await db.select({ distance: cosineDistance(documents.embedding, embeddings), pageText: documents.pageText }).from(documents).orderBy(cosineDistance(documents.embedding, embeddings)).limit(5).where(eq(documents.chatId, chatid))





        let generate = fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=AIzaSyDlLe0wUcEIF6TEOyTWvshCEqT0PgNG2bY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: {
                        text: "You are an AI summarizer named aidigest, you'll be given a set of data or text which is extracted from a document (it was extracted by vector search performed on the document). Generate a summray based on it."
                    }
                },
                contents: {
                    parts: [{
                        text: vectorSearch[0].pageText
                    }, {
                        text: vectorSearch[1].pageText
                    }, {
                        text: vectorSearch[2].pageText
                    }, {
                        text: vectorSearch[3].pageText
                    }, {
                        text: vectorSearch[4].pageText
                    }]
                }
            })
        })

        let result =  generate
        return result
    }

    catch (e: any) {
        console.log(e)
        error(400, { message: e.message })
    }
}