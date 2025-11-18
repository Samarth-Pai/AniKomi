import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = await clientPromise
    console.log("Someone trying to get user")
    const db = client.db("anikomi")
    const users = await db.collection("users")
    // const requestHeaders = await headers();
    const email = request.headers.get("email")
    const emailFind = await users.findOne({email})
    console.log("See this is what you want right: ", emailFind)
    return NextResponse.json(emailFind);
}