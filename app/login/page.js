"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const Signup = () => {
    const router = useRouter();
    const params = useSearchParams();
    const [usernameEmail, setUsernameEmail] = useState("")
    const [password, setPassword] = useState("")
    const { data: session, status } = useSession();


    useEffect(() => {
        if (status === "authenticated") {
            console.log(session);
            router.push("/");
        }
    }, [router, session, status]);

    const handleLogin = async () => {

        const res = await signIn("login", {
            redirect: false,
            usernameEmail,
            password,
        })
        console.log(res)

        // await sleep(60000);

        console.log("result", res)

        if (res.error == false)
            router.push("/")
    }


    const signInManually = async (e) => {
        // console.log("gonna sign in manually")
        // const requestOptions = {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         usernameEmail,
        //         password,
        //     }),
        //     redirect: "follow"
        // };

        // console.log("Checking if user exists")
        // const req = await fetch("http://localhost:3000/api/userPasswordExists", requestOptions)
        // const reqJson = await req.json()
        // console.log("User exists:", reqJson.message)
        // if (reqJson.message) {
        //     // await handleLogin();
        //     await signIn("login", {
        //         redirect: false,
        //         usernameEmail,
        //         password,
        //     })
        // }
        // else {
        //     console.log("Not found")
        // }
        await signIn("login", {
                redirect: false,
                usernameEmail,
                password,
        })
    }


    return (
        <>
            <div className='bgimage'>
                <img src="/shrine.jpg" className='w-[100%] h-[100%] object-cover object-center fixed' alt="" />
            </div>
            <div className='flex justify-center items-center h-[100vh]'>
                <div className='w-120 border-1 backdrop-blur-2xl bg-black/50 rounded-xl flex flex-col z-1 gap-3 justify-around p-4'>
                    <h1 className='text-3xl'>
                        Sign in
                    </h1>
                    <div className='flex gap-3 justify-between'>
                        <input onChange={(e) => setUsernameEmail(e.target.value)} value={usernameEmail} className='p-3 border-1 w-full rounded-xl' name="usernameEmail" id="usernameEmail" placeholder='Enter your username/password' />
                    </div>
                    <div className='flex gap-3 justify-between'>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className='p-3 border-1 w-full rounded-xl' name="password" id="password" placeholder='Enter password' />
                    </div>
                    <button onClick={signInManually} className='bg-yellow-800/50 p-3 rounded-xl'>
                        <span className='text-yellow-100/70'>Sign in</span>
                    </button>
                    <div className='w-full flex justify-center items-center gap-3'>
                        <span className='h-[1px] w-full bg-white/50'></span>
                        <span>Or</span>
                        <span className='h-[1px] w-full bg-white/50'></span>
                    </div>
                    <button onClick={() => signIn("google")} className='bg-yellow-800/50 p-3 rounded-xl flex justify-between'>
                        <span className='flex justify-center items-center gap-3 w-30'>
                            <Image width={35} height={35} src='/google.webp' alt='Google logo'></Image>
                            <span className='h-full bg-white w-[1px]'></span>
                        </span>
                        <span className='text-yellow-100/70 w-full flex justify-around items-center'>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Signup