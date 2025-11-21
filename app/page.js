"use client"
import Carousel from "@/components/Carousel";
import Hero from "@/components/Hero";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from 'next-auth/react'

const refetch = async (url) => {
  let req = await fetch(url)
  while (req.status != 200)
    req = await fetch(url)
  return req
}


export default function Home() {

  const [topAiring, setTopAiring] = useState([])
  const [topPopular, setTopPopular] = useState([])
  const [genres, setGenres] = useState([])
  const [seasons, setSeasons] = useState([])
  const [themes, setThemes] = useState([])
  const [demographics, setDemographics] = useState([])
  const [showGenres, setShowGenres] = useState(false)
  const [showSeasons, setShowSeasons] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showDemographics, setShowDemographics] = useState(false)
  const [recommendationMode, setRecommendationMode] = useState(false);
  const [recommendations, setRecommendations] = useState([])
  const session = useSession();

  useEffect(() => {
    const getData = async () => {
      let themesReq = await fetch("https://api.jikan.moe/v4/genres/anime?filter=themes")
      let themesJson = await themesReq.json()
      setThemes(themesJson['data'])
    }
    if (showThemes)
      getData()
  }, [showThemes])

  useEffect(() => {
    const getData = async () => {
      let genresReq = await fetch("https://api.jikan.moe/v4/genres/anime?filter=genres")
      let genresJson = await genresReq.json()
      setGenres(genresJson['data'])
    }
    if (showGenres)
      getData()
  }, [showGenres])

  useEffect(() => {
    const getData = async () => {
      let demographicsReq = await fetch("https://api.jikan.moe/v4/genres/anime?filter=demographics")
      let demographicsJson = await demographicsReq.json()
      console.log(setDemographics)
      setDemographics(demographicsJson['data'])
    }
    if (showDemographics)
      getData()
  }, [showDemographics])

  useEffect(() => {
    const getData = async () => {
      let seasonsReq = await fetch("https://api.jikan.moe/v4/seasons")
      let seasonsJson = await seasonsReq.json()
      setSeasons(seasonsJson['data'].slice(0, 20))
    }
    getData()
  }, [showSeasons])

  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  useEffect(() => {
    const getTopAiring = async () => {
      let fetched = await fetch("https://api.jikan.moe/v4/top/anime?filter=airing&&limit=10");
      let data = await fetched.json();
      setTopAiring(data['data']);

      await sleep(1000)

      let topPopularReq = await fetch("https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=10");
      let topPopularJson = await topPopularReq.json();
      setTopPopular(topPopularJson['data']);
    }
    getTopAiring()
  }, [])

  useEffect(() => {
    const getData = async () => {

      const myHeaders = new Headers();
      console.log("Sessin from", session.data)
      myHeaders.append("email", session.data.user.email);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const userReq = await fetch("/api/getUser", requestOptions)
      const user = await userReq.json();
      console.log("User was", user)

      const myHeaders2 = new Headers();
      myHeaders2.append("username", user.username);

      const requestOptions2 = {
        method: "GET",
        headers: myHeaders2,
        redirect: "follow"
      };

      const watchedReq = await fetch("/api/watchedAnimes/", requestOptions2);
      const watchedJson = await watchedReq.json();

      let watchedList = {};
      for (const item of watchedJson) {
        watchedList[item?.mal_id.toString()] = item.genres
      }
      const reccReq = await fetch('/api/apriori', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(watchedList),
      });
      const reccJson = await reccReq.json();
      const recommendedInfoes = reccJson.message;
      console.log("These will be recc", recommendedInfoes)
      setRecommendations(recommendedInfoes)

    }
    if (session.status == "authenticated" && recommendationMode)
      getData()
  }, [recommendationMode, session])


  const router = useRouter();


  return (
    <>
      <Hero authenticated={session.status == "authenticated"} recommendationMode={recommendationMode} setRecommendationMode={setRecommendationMode} />
      {/* <Carousel/> */}
      <div className="px-3 md:px-12">
        {recommendationMode && <>
          <span className='text-2xl font-semibold m-2'>
            Recommendations
          </span>
          {recommendations.length == 0 && <div className='text-xl italic m-2'>
            Loading... Please wait for few seconds...
          </div>}
          <div className='cards flex flex-wrap gap-3 z-0 relative my-5 mx-3 md:mx-10 justify-center mb-10'>

            {recommendations && recommendations.length && recommendations.map((item, ind) => {
              return <div key={ind} className="group border border-white/50 shadow-black rounded-xl p-3 w-40 md:w-60 cursor-pointer bg-black/50 backdrop-blur-2xl hover:border-4 hover:w-45 hover:md:w-65 hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all" onClick={() => router.push(`/anime/${item['mal_id']}`)}>
                <div className="h-50 md:h-85 rounded-xl overflow-hidden relative group:border-1">
                  <img src={item['images']['webp']['image_url']} className="h-full object-cover" />
                  <span className="absolute bottom-0 right-1 text-xl font-extrabold text-shadow-md text-shadow-amber-950">{item['score']}</span>
                </div>
                <div>{item['title_english'] ? item['title_english'] : item['title']}</div>
              </div>
            })}
          </div>
        </>}
        <h1 className="text-2xl font-semibold">Top Airing</h1>
        <div className="flex gap-3 flex-wrap my-5 justify-center">
          {topAiring && topAiring.length && topAiring.map((item, ind) => {
            return <div key={ind} className="group border-1 rounded-xl border-white/40 p-3 w-40 md:w-60 cursor-pointer hover:border-4 hover:w-45 hover:md:w-65 hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all" onClick={() => router.push(`anime/${item['mal_id']}`)}>
              <div className="h-50 md:h-85 rounded-xl overflow-hidden relative group-hover:border-1">
                <img src={item['images']['webp']['image_url']} className="h-full object-cover" />
                <span className="absolute bottom-0 right-1 text-xl font-extrabold text-shadow-md text-shadow-amber-950">{item['score']}</span>
              </div>
              <div className="text-sm text-white">{item['title_english'] ? item['title_english'] : item['title']}</div>
            </div>
          })}
        </div>

        <h1 className="text-2xl font-semibold">Most Popular</h1>
        <div className="flex gap-3 flex-wrap my-5 justify-center">
          {topPopular && topPopular.length && topPopular.map((item, ind) => {
            return <div key={ind} className="group border rounded-xl border-white/40 p-3 w-40 md:w-60 cursor-pointer hover:border-4 hover:w-45 hover:md:w-65 hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all" onClick={() => router.push(`anime/${item['mal_id']}`)}>
              <div className="h-50 md:h-85 rounded-xl overflow-hidden relative group-hover:border-1">
                <img src={item['images']['webp']['image_url']} className="h-full object-cover" />
                <span className="absolute bottom-0 right-1 text-xl font-extrabold text-shadow-md text-shadow-amber-950">{item['score']}</span>
              </div>
              <div>{item['title_english'] ? item['title_english'] : item['title']}</div>
            </div>
          })}
        </div>


        <div className="bg-blue-950 rounded-xl p-3 transition-all">
          <div className="flex gap-3 justify-between cursor-pointer" onClick={() => setShowGenres(!showGenres)}>
            <h1 className="text-xl text-blue-200">Genres</h1>
            {showGenres ? <img src="/down-arrow.svg" /> : <img src="/up-arrow.svg" />}
          </div>
          {showGenres && (<div className="flex flex-wrap gap-2 justify-between">
            {genres.length && genres.map((item, ind) => {
              return <button key={ind} className="bg-blue-900 p-3 w-fit min-w-24 rounded-md text-blue-200" onClick={() => router.push(`genre/${item['mal_id']}?name=${item['name']}`)}>
                {item.name}
              </button>
            })}
          </div>)
          }
        </div>

        <div className="bg-yellow-950 rounded-xl p-3 my-3 transition-all">
          <div className="flex gap-3 justify-between cursor-pointer" onClick={() => setShowThemes(!showThemes)}>
            <h1 className="text-xl text-yellow-200">Themes</h1>
            {showThemes ? <img src="/down-arrow.svg" /> : <img src="/up-arrow.svg" />}
          </div>
          {showThemes && (<div className="flex flex-wrap gap-2 justify-between">
            {themes.length && themes.map((item, ind) => {
              return <button key={ind} className="bg-yellow-900 p-3 w-fit min-w-24 rounded-md text-yellow-200" onClick={() => router.push(`theme/${item['mal_id']}?name=${item['name']}`)}>
                {item.name}
              </button>
            })}
          </div>)
          }
        </div>

        <div className="bg-yellow-950 rounded-xl p-3 my-3 transition-all">
          <div className="flex gap-3 justify-between cursor-pointer" onClick={() => setShowDemographics(!showDemographics)}>
            <h1 className="text-xl text-yellow-200">Demographics</h1>
            {showDemographics ? <img src="/down-arrow.svg" /> : <img src="/up-arrow.svg" />}
          </div>
          {showDemographics && (<div className="flex flex-wrap gap-2 justify-between">
            {demographics.length && demographics.map((item, ind) => {
              return <button key={ind} className="bg-yellow-900 p-3 w-fit min-w-24 rounded-md text-yellow-200" onClick={() => router.push(`demography/${item['mal_id']}?name=${item['name']}`)}>
                {item.name}
              </button>
            })}
          </div>)
          }
        </div>


        <div className="bg-green-950 rounded-xl p-3 my-3 transition-all">
          <div className="flex gap-3 justify-between cursor-pointer" onClick={() => setShowSeasons(!showSeasons)}>
            <h1 className="text-xl text-green-200">Seasons</h1>
            {showSeasons ? <img src="/down-arrow.svg" /> : <img src="/up-arrow.svg" />}
          </div>
          <div className={"flex flex-wrap gap-2 justify-between overflow-hidden"}>
            {showSeasons && seasons.length > 0 &&
              seasons.flatMap((item) =>
                item["seasons"].map((s, idx) => (
                  <button
                    key={`${item.year}-${s}`}
                    className="bg-green-900 p-3 rounded-md text-green-200"
                    onClick={() => router.push(`seasonal?year=${item.year}&season=${s}`)}
                  >
                    {item.year} - {s}
                  </button>
                ))
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}


