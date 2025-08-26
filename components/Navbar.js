"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
const capitalizeString = (s) => s && s[0].toUpperCase() + s.slice(1, s.length)


const Navbar = () => {
  const router = useRouter()
  const [animeSearch, setAnimeSearch] = useState("")
  const [animes, setAnimes] = useState([])
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
    <nav className='flex justify-between items-center border-b px-3 fixed z-10 w-full backdrop-blur-2xl bg-amber-950/50'>
        <div>
            <h1 className='text-xl md:text-4xl font-bold font-giest-mono cursor-pointer' onClick={()=>router.push("/")}>
                AniKomi
            </h1>
        </div>
        <div className='flex justify-center items-center relative'>
            <input
                type="text"
                className='border h-10 m-3 p-3 w-50 md:w-100'
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
            <img src="search.svg" alt="" className='h-8 cursor-pointer' onClick={(e) => {
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

        </div>
    </nav>
  )
}

export default Navbar