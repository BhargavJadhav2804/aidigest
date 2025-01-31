import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { text } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request }) => {

    return text("Nothing here mate!")

    let formdata = await request.formData()
    let formData1 = formdata.get('file') as File
    let formData2 = formdata.get('fileName') as string

    let form = new FormData()
    form.append('file', formData1)


    const response = await fetch(
        `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${env.API_KEY}`,
        {
            method: 'POST',
            body: form,
            headers: {
                "Content-Type": "application/pdf"
            }
        }
    );
    console.log("FORM DATA:", await response.json())


    return new Response();
};