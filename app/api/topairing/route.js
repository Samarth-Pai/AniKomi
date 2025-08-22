import { NextResponse } from "next/server";

export async function GET(request) {
    const myHeaders = new Headers();
    myHeaders.append("X-MAL-CLIENT-ID", "897863e27778c5c7fa26d4cc47e599ae");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    console.log("OK")
    let fetched = await fetch("https://api.myanimelist.net/v2/anime/ranking?ranking_type=airing", requestOptions)
    let data = await fetched.json()
    return Response.json({success: true, error: false, data})
}