import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb'

export async function POST(request) {
  const client = await clientPromise
  const db = await client.db("anikomi")
  const users = await db.collection("users")
  // const userResult = await users.findOne({email: userDict.email})

  const userDict = await request.json();
  console.log("Came to add a user", userDict)
  await users.insertOne({
    username: userDict.username,
    name: userDict.name,
    email: userDict.email,
    password: userDict.password,
    oauth: false,
    friends: [],
    image: "/default-avatar.png"
  })
  return NextResponse.json({message: true, success: true, error: false})
}