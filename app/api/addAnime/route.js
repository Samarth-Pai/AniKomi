import clientPromise from '../../lib/mongodb'
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if(!session)
        return NextResponse.json({message: false, success: true, error: false});

    const client = await clientPromise
    const db = await client.db("anikomi")
    const completions = await db.collection("completions")
    const heads = await request.json()

    const myHeaders = new Headers();
    myHeaders.append("email", session.user?.email);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'; // Adjust based on your environment
    const baseUrl = `${protocol}://${host}`;
    
    const userReq = await fetch(baseUrl + "/api/getUser", requestOptions)
    const user = await userReq.json();
    console.log("Headas", heads)

    const hasAlreadyAdded = await completions.findOne({
        "username": user.username,
        "mal_id": heads.mal_id
    })
    if(hasAlreadyAdded){
        await completions.findOneAndUpdate({
            "username": user.username,
            "mal_id": heads.mal_id
        },{
            "$set":{
                "completionStatus": heads.completionStatus,
                "rating": heads.rating,
                "opinion": heads.opinion
            }
        })
    }
    else{
        await completions.insertOne({
            "email": heads.email,
            "username": user.username, // replaced with email
            "mal_id": heads.mal_id,
            "animename": heads.animename,
            "genres": heads.genres,
            "completionStatus": heads.completionStatus,
            "rating": heads.rating,
            "opinion": heads.opinion,
            "image": heads.image,
            "addedDate": new Date()
        })
    }

    return NextResponse.json({message: true, success: true, error: false});
}