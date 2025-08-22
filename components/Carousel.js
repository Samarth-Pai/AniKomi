"use client"
import React, { useEffect, useState } from 'react'

const Carousel = () => {
    const [animes, setAnimes] = useState([])
    const [animePointer, setAnimePointer] = useState(0)
    useEffect(() => {
        const getData = async () => {
            const seasonsReq = await fetch("https://api.jikan.moe/v4/seasons/now?limit=10")
            const seasonsData = await seasonsReq.json()
            setAnimes(seasonsData['data'])
            console.log(seasonsData['data'])
            console.log(seasonsData['data'][0]['images']['webp']['large_image_url'])
        }
        getData()
    }, [])

    console.log(animes.length)
    return animes.length ?  (
        <div className={`w-full flex justify-end h-[70vh] items-center overflow-hidden`}>
            <img src={animes[animePointer]['trailer']['images']['maximum_image-url']} className='w-[80vw] object-cover'/>
            <div className="absolute bottom-[0] left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
    ): ""
}

export default Carousel