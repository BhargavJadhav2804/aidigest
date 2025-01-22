import { API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


export const POST: RequestHandler = async ({ request }) => {
   
    return new Response();
};