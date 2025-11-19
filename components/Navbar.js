"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
const capitalizeString = (s) => s && s[0].toUpperCase() + s.slice(1, s.length)


const Navbar = () => {
  const router = useRouter()
  const { data: session, status } = useSession();
  const [animeSearch, setAnimeSearch] = useState("")
  const [animes, setAnimes] = useState([])
  const [user, setUser] = useState({})
  const [showMenu, setShowMenu] = useState(false)
  useEffect(() => {
    const getUser = async () => {
      const myHeaders = new Headers();
      myHeaders.append("email", session.user.email);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      const req = await fetch("/api/getUser", requestOptions);
      const userData = await req.json()
      console.log("Userdata", session.user)
      setUser(userData);
    }
    if(status == "authenticated")
      getUser();
  }, [session, status])
  
  const handleInput = (s) => {
    setAnimeSearch(s)
    const getData = async () => {
      let animesReq = await fetch(`https://api.jikan.moe/v4/anime?q=${s}&limit=5`)
      let animesJson = await animesReq.json()
      console.log(animesJson)
      setAnimes(animesJson['data'])
    }
    getData()
  }


  return (
    <nav className='flex justify-between items-center border-b px-2 md:px-3 fixed z-10 w-full backdrop-blur-2xl bg-amber-950/50'>
        <div>
            <h1 className='text-xl md:text-4xl font-bold font-giest-mono cursor-pointer' onClick={()=>router.push("/")}>
                AniKomi
            </h1>
        </div>
        <div className='flex justify-center items-center relative'>
            <input
                type="text"
                className='border h-10 mx-1 my-2 md:mx-3 md:my-3 p-3 w-40 md:w-100'
                placeholder='search here'
                value={animeSearch}
                onChange={e => {
                  handleInput(e.target.value)}
                }
                onKeyDown={(e)=>{
                  if(e.key == "Enter" && e.target.value.trim() != ""){
                    router.push(`/search?q=${animeSearch}`)
                    setAnimeSearch("")
                  }
                }
                }
            />
            <img src="search.svg" alt="" className='h-8 cursor-pointer hidden md:inline' onClick={(e) => {
              if(animeSearch.trim() != ""){
                router.push(`/search?q=${animeSearch}`)
                setAnimeSearch("")
              }
            }}/>
            <div className='absolute w-80 md:w-130 bg-black/90 top-16 flex flex-col gap-3 rounded-xl'>
              {
                animeSearch!="" && animes && animes.map((item, ind) => {
                  return <div key={ind} className='flex gap-2 rounded-xl p-3 cursor-pointer' onClick={() =>{
                    setAnimeSearch("")
                    router.push(`/anime/${item.mal_id}`)
                  }}>
                    <div className='image w-14 rounded-md overflow-hidden'>
                      <img className='object-cover' src={item['images']['webp']['small_image_url']} alt="" />
                    </div>
                    <div className='flex flex-col w-full'>
                      <div>
                        {item.title_english || item.title}
                      </div>
                      <div>
                        <span className='font-semibold'>{item.type}</span> - <span> {item.episodes} episodes ({item.status})</span>
                      </div>
                      <div>
                        <span>{capitalizeString(item.season)}</span> <span>{item.year}</span>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>
        </div>
        <div>
          {status == "authenticated"?<>
            <div className='relative rounded-full'>
              <Image
                src={session.user?.image || "/default-avatar.png"}
                alt={session.user?.name ? `${session.user.name}'s avatar` : "User avatar"}
                width={50}
                height={50}
                className='rounded-full object-cover'
                priority
                onClick={(e) => setShowMenu(!showMenu)}
              />
              {showMenu && <div className='absolute rounded-lg p-2 right-0 bg-black/80 border'>
                  <button className='p-1' onClick={(e) => setShowMenu(false) || router.push(`/profile/${user["username"]}`)}>
                    Profile
                  </button>
                  <div className='h-[0.5px] bg-amber-50 w-full'></div>
                  <button className='p-1' onClick={(e) => setShowMenu(false) || signOut()}>
                    Logout
                  </button>
                </div>
                }
            </div>
              
            </>:<>
            <button className='p-1 md:p-2 m-1 md:m-2 border border-white/50 bg-black/50 rounded-md md:rounded-xl backdrop-blur-sm cursor-pointer md:hover:p-3 md:hover:border-3 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all text-sm' onClick={()=>router.push("/signup")}>
              Signup
            </button>
            <button className='p-1 md:p-2 m-1 md:m-2 border border-white/50 bg-black/50 rounded-md md:rounded-xl backdrop-blur-sm cursor-pointer md:hover:p-3 md:hover:border-3 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all text-sm' onClick={()=>router.push("/login")}>
              Login
            </button>
          </>}
        </div>
    </nav>
  )
}

export default Navbar