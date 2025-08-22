"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const capitalizeString = (s) => s && s[0].toUpperCase() + s.slice(1, s.length)

const anime = ({ params }) => {
    const [animeData, setAnimeData] = useState({})
    const [review, setReview] = useState("")
    const [relationships, setRelationships] = useState([])
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            const { id } = await params;
            const animeReq = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
            const animeJson = await animeReq.json()
            setAnimeData(animeJson)

            const reviewReq = await fetch("/api/aireview?" + new URLSearchParams({ title: animeJson['data']['title_english'] || animeJson['data']['title'] }))
            const reviewJson = await reviewReq.json()
            setReview(reviewJson['message'])

            let relations = [];
            for (let otherAnime of animeJson['data']['relations']) {
                if (["Prequel", "Sequal", "Side Story"].includes(otherAnime['relation'])) {
                    const otherAnimeReq = await fetch(`https://api.jikan.moe/v4/anime/${otherAnime["entry"][0]["mal_id"]}/full`)
                    const otherAnimeJson = await otherAnimeReq.json()
                    otherAnimeJson['data']['howrelated'] = otherAnime['relation']
                    relations.push(otherAnimeJson['data'])
                    // await sleep(1000)
                }
            }
            console.log(relations)
            setRelationships(relations)
        }
        getData()
    }, [])

    if (animeData['data'] == undefined)
        return <Skeleton />
    return (
        <>
            <div className='p-3 flex gap-3 w-full relative pb-30 pt-20 flex-col md:flex-row'>
                {/* Background image with fade effect */}
                <div className="absolute inset-0 -z-10">
                    <div className="w-full h-full bg-[url('/school-bg.webp')] bg-center bg-cover" />
                    <div className="absolute bottom-[0] left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                </div>
                <div className='image text-shadow-md'>
                    <div className='image-src relative w-70 rounded-md overflow-hidden drop-shadow-sm drop-shadow-black flex justify-center items-center'>
                        <img src={animeData['data']['images']['webp']['large_image_url']} alt="" />
                        <span className='absolute bottom-0 right-1 font-semibold text-xl text-shadow-amber-800 text-shadow-md'>{animeData['data']['score']}</span>
                    </div>
                    <div className='text-white font-medium drop-shadow-xs drop-shadow-black'>{animeData['data']['season']} {animeData['data']['year']} ({animeData['data']['status']})</div>
                    {animeData['data']['rating'] && <div className='font-semibold text-shadow-xs'>Rated <span className='font-semibold bg-gradient-to-tl text-transparent from-emerald-300 to-emerald-100 bg-clip-text'>{animeData['data']['rating']}</span></div>}
                    <div className='relationships flex flex-col gap-2 bg-black/45 backdrop-blur-md rounded-lg'>
                        {relationships && relationships.map((item, ind) => {
                            return <div key={ind} className='flex gap-2 rounded-xl p-3 cursor-pointer' onClick={() => {
                                router.push(`/anime/${item.mal_id}`)    
                            }}>
                                <div className='image w-14'>
                                    <img className='object-cover rounded-md overflow-hidden' src={item['images']['webp']['small_image_url']} alt="" />
                                </div>
                                <div className='flex flex-col w-full'>
                                    <div className='text-xl font-semibold'>
                                        {item.howrelated}
                                    </div>
                                    <div className='overflow-ellipsis'>
                                        {item.title_english || item.title}
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    <div className='info flex flex-col w-full bg-black/45 backdrop-blur-md rounded-lg p-4'>
                        <div className='text-3xl font-bold'>
                            <span className='bg-gradient-to-t text-transparent from-gray-400 to-gray-100 bg-clip-text'>{animeData['data']['title_english'] || animeData['data']['title']}</span>
                        </div>
                        <div className='text-xl font-semibold'>
                            Studio: <span className='bg-gradient-to-r text-transparent from-red-400 to-red-300 bg-clip-text'>{animeData['data']['studios'].map(s => s['name']).join(", ")}</span>
                        </div>
                        <div className='description'>
                            <p>{animeData['data']['synopsis']}</p>
                        </div>
                    </div>
                    <div className='info w-full bg-black/45 backdrop-blur-md rounded-lg p-4'>
                        <div className={'trailer grid justify-between min-h-60 w-full' + (animeData['data']['trailer']['embed_url'] ? "grid-rows-[2fr_1fr] md:grid-cols-[1fr_2fr]" : "grid-cols-[1fr]")}>
                            {animeData['data']['trailer']['embed_url'] && <iframe className='w-full h-full min-h-60' src={animeData['data']['trailer']['embed_url']} title="YouTube video player" allow="accelerometer;clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>}
                            <div className='w-full flex flex-col gap-3 p-2'>
                                <div className='genre'>
                                    <div className='text-xl flex gap-2 text-blue-300'>Genres</div>
                                    {animeData['data']['genres'].map((item, ind) => {
                                        return <button key={ind} className='p-2 bg-blue-950/50 m-1 rounded-md' onClick={()=>router.push(`/genre/${item['mal_id']}?name=${item['name']}`)}>
                                            <span className='text-blue-300'>{item['name']}</span>
                                        </button>
                                    })}
                                </div>
                                {animeData['data']['themes'].length ? <>
                                    <div className='division bg-white h-[1px]'></div>
                                    <div className='themes'>
                                        <div className='text-xl flex gap-2 text-yellow-300'>Themes</div>
                                        {animeData['data']['themes'].map((item, ind) => {
                                            return <button key={ind} className='p-2 bg-yellow-950/50 m-1 rounded-md' onClick={()=>router.push(`/theme/${item['mal_id']}?name=${item['name']}`)}>
                                                <span className='text-yellow-300'>{item['name']}</span>
                                            </button>
                                        })}
                                    </div>
                                </> : ""}

                                {animeData['data']['demographics'].length ? <>
                                    <div className='division bg-white h-[1px] w-full'></div>
                                    <div className='themes'>    
                                        <div className='text-xl flex gap-2 text-orange-300'>Demographics</div>
                                        {animeData['data']['demographics'].map((item, ind) => {
                                            return <button key={ind} className='p-2 bg-orange-950/50 m-1 rounded-md' onClick={()=>router.push(`/demography/${item['mal_id']}?name=${item['name']}`)}>
                                                <span className='text-orange-300'>{item['name']}</span>
                                            </button>
                                        })}
                                    </div>
                                </> : ""}
                            </div>
                        </div>
                    </div>
                    <div className='info flex flex-col w-full bg-black/45 backdrop-blur-md rounded-lg p-4'>
                        <div className='pt-2'>
                            <div className='text-2xl font-semibold'>How is the anime?</div>
                            <div className={`review-card transition-all duration-700 ${review ? "opacity-100" : "opacity-50"}`}>
                                {review
                                    ? <p className="transition-all duration-500 opacity-100">{review}</p>
                                    : (
                                        <SkeletonTheme baseColor="#50C878" highlightColor="white">
                                            <Skeleton count={3} className="transition-opacity duration-500 opacity-100" />
                                        </SkeletonTheme>
                                    )
                                }
                            </div>
                        </div>
                        {animeData['data']['streaming'].length ? <>
                            <div className='pt-2'>
                                <div className='text-2xl font-semibold'>Where can I watch this?</div>
                                <div className='streaming-cards flex gap-2 flex-wrap'>
                                    {animeData['data']['streaming'].map((item, ind) => {
                                        return <Link href={item.url} key={ind}> <button className='p-2 bg-emerald-950/50 rounded-md'>
                                            <span className='text-amber-100'>{item.name}</span>
                                        </button>
                                        </Link>
                                    })}
                                </div>
                            </div>
                        </> : ""}
                    </div>
                </div>
            </div >
        </>
    )
}

export default anime