import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = await clientPromise
    const db = await client.db("anikomi")
    const completions = await db.collection("completions")
    const username = request.headers.get("username")
    console.log("I want this guys's watched:", username)
    const watched = await completions.find({username, completionStatus: "watched"});
    const watchedArray = await watched.toArray()
    return Response.json(watchedArray);
}