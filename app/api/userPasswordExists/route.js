import clientPromise from '../../lib/mongodb'

export async function GET(request) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    console.log("Wait man checking")
    const client = await clientPromise
    const db = client.db("anikomi")
    const users = await db.collection("users")
    // const requestHeaders = await headers();
    const usernameEmail = request.headers.get("usernameemail")
    const password = request.headers.get("password")
    console.log("Inside head", request.headers)
    const emailFind = await users.findOne({email: usernameEmail, password: password})
    console.log("email find", emailFind, {email: usernameEmail, password: password})
    if(emailFind)
        return Response.json({message: true, email: emailFind.email, status: "successful", oauth: emailFind.oauth});
    const usernameFind = await users.findOne({username: usernameEmail, password: password})
    console.log("username find", usernameFind, {username: usernameEmail, password: password});
    if(usernameFind)
        return Response.json({message: true, email: usernameFind.email, status: "successful", oauth: usernameFind.oauth});
    return Response.json({message: false, status: "successful"});
}