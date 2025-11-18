import clientPromise from '../../../lib/mongodb'
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if(!session)
        return NextResponse.json({message: false, success: true, error: false});

    const { mal_id } = await params;
    const client = await clientPromise
    const db = await client.db("anikomi")
    const completions = await db.collection("completions")
    
    // const myHeaders = new Headers();
    // myHeaders.append("email", session.user?.email);

    // const requestOptions = {
    // method: "GET",
    // headers: myHeaders,
    // redirect: "follow"
    // };
    
    // const userReq = await fetch("http://localhost:3000/api/getUser", requestOptions)
    // const user = await userReq.json();
    const hasAddedReq = await completions.findOne({email: session.user?.email, mal_id:  parseInt(mal_id)})
    console.log("Has added: ", hasAddedReq)
    if(hasAddedReq)
        return NextResponse.json({message: 1, success: true, error: false});
    return NextResponse.json({message: 0, success: true, error: false});
}