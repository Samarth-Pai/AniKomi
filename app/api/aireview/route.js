import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const searchParams = request.nextUrl.searchParams;
    const animeTitle = searchParams.get("title");
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Just give a paragraph on review based on various user's opinions and how they felt watching this and dont use any kind of markdown: ${animeTitle}`,
    });
    return Response.json({message: response.text, success: true, error: false})
}