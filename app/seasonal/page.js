"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const Seasonal = ({ prms }) => {
    const params = useSearchParams();
    const season = params.get("season");
    const year = params.get("year");
    const [animes, setAnimes] = useState([])
    const router = useRouter()
    const fadePosition = { summer: 1223 }
    const seasonName = season[0].toUpperCase() + season.slice(1, season.length)
    useEffect(() => {
        const getData = async () => {
            const seasonReq = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`)
            const seasonJson = await seasonReq.json()
            setAnimes(seasonJson['data'])
        }
        getData()
    }, [])

    return (
        <>
            <div>
                <div className='bgimage'>
                    <img src={`${season}-bg.jpg`} className='w-[100%] h-[100%] object-cover object-center fixed' alt="" />
                </div>
                <div className='px-[10vw] pb-3 text-3xl pt-20 font-bold relative'>
                    {seasonName} {year}
                </div>
                {/* <div className={`absolute top-[${fadePosition[season]}px] left-0 h-32 w-full bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0`} /> */}
                <div className='cards flex flex-wrap gap-3 z-0 relative mx-10 justify-center mb-10'>
                    {animes && animes.length && animes.map((item, ind) => {
                        return <div key={ind} className="border border-white/50 shadow-black rounded-xl p-3 w-60 cursor-pointer bg-black/50 backdrop-blur-2xl" onClick={() => router.push(`anime/${item['mal_id']}`)}>
                            <div className="h-85 rounded-xl overflow-hidden relative">
                                <img src={item['images']['webp']['image_url']} className="w-60 h-full object-cover" />
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

const SuspendedSeasonal = () => {
    return (<Suspense>
        <Seasonal />
    </Suspense>
    )
}

export default SuspendedSeasonal