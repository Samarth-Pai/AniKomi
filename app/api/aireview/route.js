import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const searchParams = request.nextUrl.searchParams;
    const animeTitle = searchParams.get("title");
    const id = searchParams.get("id");

    console.log(`https://api.jikan.moe/v4/anime/${id}/reviews?preliminary=true`)
    const reviewsReq = await fetch(`https://api.jikan.moe/v4/anime/${id}/reviews?preliminary=true`)
    const reviewsJson = await reviewsReq.json();
    // console.log("Revies json", reviewsJson)
    // console.log(reviewsJson["data"].slice(0, 3))
    let reviews = reviewsJson['data'].map(e=>e.review)
    reviews = reviews.slice(0, 3)
    const infoDumpString = reviews.join("\n")

    // const response = await ai.models.generateContent({
    //     model: "gemini-2.5-flash",
    //     contents: `Just give a paragraph on review based on various user's opinions and how they felt watching this and dont use any kind of markdown: ${animeTitle}`,
    // });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Anime title: ${animeTitle}. Just give a brief summary on how the anime is from these reviews: ${infoDumpString}. Don't use any kind of markdown and don't begin with "Based on these reviews". Just direcly summarise it`,
    });



    

    // const response = {
    //     text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Modi alias ullam dolor, minus provident neque cum earum distinctio nemo deleniti cupiditate vitae eveniet saepe unde tempore accusamus. Omnis quos similique sequi quis, facere voluptas velit repudiandae sapiente laboriosam veniam vero quia perspiciatis voluptatum architecto dicta repellendus officiis non ipsum consequatur a distinctio obcaecati. Aut id, sint autem assumenda maxime iste. Amet aut, tempora nihil beatae, laboriosam hic veritatis rerum alias quasi itaque delectus omnis sit non explicabo corporis enim at cum assumenda odio id dicta quod. Magnam, recusandae. Odit quidem eveniet pariatur amet quae hic nemo iusto tenetur placeat obcaecati blanditiis autem ipsa, et illo rem ducimus porro expedita sit eos veniam consequuntur quos! Sed itaque est iure sapiente! Optio quos reiciendis voluptatem!"
    // }
    if(response.success)
        return Response.json({message: response.text, success: true, error: false})
    else
        return Response.json({message: reviews[0], success: true, error: false})
}