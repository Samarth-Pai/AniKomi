"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Signup = () => {
    const { data: session } = useSession()
    const router = useRouter();
    const params = useSearchParams();
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [email, setEmail] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [dontAllow, setDontAllow] = useState(false)

    const confirmUsername = params.get("confirmUsername")
    useEffect(() => {
      if(session){
          router.push("/")
      }
    }, [router, session])

    const handleSignup = async (e) => {
        console.log("hBhaava")
        e.preventDefault()

        const myHeaders = new Headers()
        myHeaders.append("name", name)
        myHeaders.append("username", username)
        myHeaders.append("email", email)
        myHeaders.append("password", password)

        const userExistsReq = await fetch("/api/userExists", {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        })

        const userExistsJson = await userExistsReq.json();
        if(userExistsJson.message){
            setErrorMessage("User already exists")
            return
        }

        // First, register the user via API
        const signupRes = await fetch('/api/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                username,
                email,
                password,
            }),
        })

        if (!signupRes.ok) {
            console.error('Signup failed:', await signupRes.text())
            return
        }

        // Then, sign in the user
        const res = await signIn("login", {
            redirect: false,
            email,
            password,
        })
        console.log(res)

        console.log("result", res)

        if (res?.ok) {
            router.push("/")
        }
    }
    
    return (
        <>
            <div className='bgimage'>
                <img src="/shrine.jpg" className='w-[100%] h-[100%] object-cover object-center fixed' alt="" />
            </div>
            <div className='flex justify-center items-center h-[100vh]'>
                <form onSubmit={handleSignup} method='POST'>
                    <div className='w-120 border-1 backdrop-blur-2xl bg-black/50 rounded-xl flex flex-col z-1 gap-3 justify-around p-4'>
                        <h1 className='text-3xl'>
                            Signup
                        </h1>
                        <input onChange={e=>setEmail(e.target.value)} className='p-3 border-1 rounded-xl' type="email" name="email" id="email" placeholder='Enter your email' />
                        <div className='flex gap-3 justify-between'>
                            <input onChange={e=>setUsername(e.target.value)} className='p-3 border-1 w-full rounded-xl' type="text" name="username" id="username" placeholder='Enter your username' />
                            <input onChange={e=>setName(e.target.value)} className='p-3 border-1 w-full rounded-xl' type="text" name="name" id="name" placeholder='Enter your name' />
                        </div>
                        <div className='flex gap-3 justify-between'>
                            <input onChange={e=>setPassword(e.target.value)} className='p-3 border-1 w-full rounded-xl' type="password" name="password" id="password" placeholder='Enter password' />
                            <input onChange={e=>setConfirmPassword(e.target.value)} className='p-3 border-1 w-full rounded-xl' type="password" name="confirmPassword" id="confirmPassword" placeholder='Enter confirm password' />
                        </div>
                        <button type='submit' className='bg-yellow-800/50 p-3 rounded-xl'>
                            <span className='text-yellow-100/70'>Sign Up</span>
                        </button>
                        <div className='w-full flex justify-center items-center gap-3'>
                            <span className='h-[1px] w-full bg-white/50'></span>
                            <span>Or</span>
                            <span className='h-[1px] w-full bg-white/50'></span>
                        </div>
                        <button onClick={()=>signIn("google")} className='bg-yellow-800/50 p-3 rounded-xl flex justify-between'>
                            <span className='flex justify-center items-center gap-3 w-30'>
                                <Image width={35} height={35} src='/google.webp' alt='Google logo'></Image>
                                <span className='h-full bg-white w-[1px]'></span>
                            </span>
                            <span className='text-yellow-100/70 w-full flex justify-around items-center'>Sign up with Google</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Signup