import clientPromise from '../../lib/mongodb'
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if(!session)
        return NextResponse.json({message: false, success: true, error: false});

    const client = await clientPromise
    const db = await client.db("anikomi")
    const completions = await db.collection("completions")
    const heads = await request.json()


    console.log("Headas", heads)

    await completions.deleteOne({
        "email": session.user?.email,
        "mal_id": heads.mal_id,
    })

    return NextResponse.json({message: true, success: true, error: false});
}