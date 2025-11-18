import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = await clientPromise
    const db = client.db("anikomi")
    const users = await db.collection("users")
    const data = await users.findOne({})
    // users.insertOne({uname: "samarthpai", name: "Samarth Pai", animeList: []})
    return Response.json(data)
}