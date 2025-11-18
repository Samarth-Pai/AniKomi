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

    // const response = {
    //     text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Modi alias ullam dolor, minus provident neque cum earum distinctio nemo deleniti cupiditate vitae eveniet saepe unde tempore accusamus. Omnis quos similique sequi quis, facere voluptas velit repudiandae sapiente laboriosam veniam vero quia perspiciatis voluptatum architecto dicta repellendus officiis non ipsum consequatur a distinctio obcaecati. Aut id, sint autem assumenda maxime iste. Amet aut, tempora nihil beatae, laboriosam hic veritatis rerum alias quasi itaque delectus omnis sit non explicabo corporis enim at cum assumenda odio id dicta quod. Magnam, recusandae. Odit quidem eveniet pariatur amet quae hic nemo iusto tenetur placeat obcaecati blanditiis autem ipsa, et illo rem ducimus porro expedita sit eos veniam consequuntur quos! Sed itaque est iure sapiente! Optio quos reiciendis voluptatem!"
    // }
    return Response.json({message: response.text, success: true, error: false})
}