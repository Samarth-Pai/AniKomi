"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const refetch = async (url) => {
  let req = await fetch(url)
  while(req.status != 200)
    req = await fetch(url)
  return req
}

const Search = ({ prms }) => {
    const params = useSearchParams();
    const search = params.get("q");
    const [animes, setAnimes] = useState([])
    const router = useRouter()
    useEffect(() => {
        const getData = async () => {
            setAnimes([])
            console.log(search)
            // const searchReq = await fetch(`https://api.jikan.moe/v4/anime?q=${search}`)
            const searchReq = await refetch(`https://api.jikan.moe/v4/anime?q=${search}`)
            const searchJson = await searchReq.json()
            console.log("Keete")
            setAnimes(searchJson['data'])
        }
        getData()
    }, [search])

    return (
        <>
            <div>
                <div className='bgimage'>
                    <img src={`garden-school.jpg`} className='w-[100%] h-[100%] object-cover object-center fixed' alt="" />
                </div>
                <div className='px-[10vw] pb-3 text-3xl pt-20 font-bold relative'>
                    Search result for &quot;{search}&quot;
                </div>
                {/* <div className={`absolute top-[${fadePosition[season]}px] left-0 h-32 w-full bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0`} /> */}
                <div className='cards flex flex-wrap gap-3 z-0 relative mx-3 md:mx-10 justify-center mb-10'>
                    {animes && animes.length && animes.map((item, ind) => {
                        return <div key={ind} className="group border border-white/50 shadow-black rounded-xl p-3 w-45 md:w-60 cursor-pointer bg-black/50 backdrop-blur-2xl hover:border-4 hover:w-45 hover:md:w-65 hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all" onClick={() => router.push(`anime/${item['mal_id']}`)}>
                            <div className="h-50 md:h-85 rounded-xl overflow-hidden relative group-hover:border-1">
                                <img src={item['images']['webp']['image_url']} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 right-1 text-xl font-extrabold text-shadow-md text-shadow-amber-950">{item['score']}</span>
                            </div>
                            <div>{item['title_english'] ? item['title_english'] : item['title']}</div>
                        </div>
                    })}
                </div>
            </div>
        </>
    )
}

const SuspendedSearch = () => {
    return (<Suspense>
        <Search />
    </Suspense>
    )
}

export default SuspendedSearch