import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const client = await clientPromise
    const db = client.db("anikomi")
    const users = await db.collection("users")
    // const requestHeaders = await headers();
    const usernameEmail = request.headers.get("usernameemail")
    console.log("Checking if user exits")
    const emailFind = await users.findOne({email: usernameEmail})
    if(emailFind)
        return Response.json({message: true, status: "successful", oauth: emailFind.oauth});
    const usernameFind = await users.findOne({username: usernameEmail})
    console.log(usernameFind)
    if(usernameFind)
        return Response.json({message: true, status: "successful", oauth: usernameFind.oauth})
    return Response.json({message: false, status: "successful", oauth: request.headers.get("oauth")});
}