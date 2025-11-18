import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = await clientPromise
    const db = client.db("anikomi")
    const users = await db.collection("users")
    const username = request.headers.get("username")
    console.log(username)
    const usernameFind = await users.findOne({username})
    console.log("Usernmae", usernameFind)
    return Response.json(usernameFind);
}