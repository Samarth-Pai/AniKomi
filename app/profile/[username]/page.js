"use client"
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const Profile = ({ params }) => {

  const getUser = async (username) => {
    const myHeaders = new Headers();
    myHeaders.append("username", username);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const baseUrl = `${window.location.protocol}//${window.location.host}`
    console.log(baseUrl)
    const req = await fetch(baseUrl + "/api/getUserFromUsername", requestOptions);
    console.log("Dta", req)
    const data = await req.json();
    setuserInfo(data);
    return data
  }

  const router = useRouter()
  const session = useSession()

  const [userInfo, setuserInfo] = useState({})
  const [watched, setWatched] = useState([])
  const [recommendationMode, setRecommendationMode] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [myself, setMyself] = useState(false);

  useEffect(() => {
    const getData = async () => {
      console.log("Ok", session.data?.user?.email)
      const { username } = await params
      // if(session.data?.user?.email)
      //   getUser(session.data.user.email)
      const userData = await getUser(username)
      if(session.status == "authenticated" && userData.email == session.data.user.email)
        setMyself(true);

      const myHeaders = new Headers();
      myHeaders.append("username", userData.username);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const watchedReq = await fetch("/api/watchedAnimes/", requestOptions);
      const watchedJson = await watchedReq.json()
      console.log("What ", watchedJson)
      setWatched(watchedJson);
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      console.log("ok now", watched)
      let watchedList = {};
      for(const item of watched){
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
    if (recommendationMode)
      getData();
  }, [recommendationMode, watched])


  return (
    <>
      <div className='bgimage'>
        <img src="/shrine.jpg" className='w-[100%] h-[100%] object-cover object-center fixed z-[-1]' alt="" />
      </div>
      <div className='flex gap-2 pt-20 flex-col md:flex-row h-fit'>
        <div className="flex flex-col gap-2 w-auto md:w-full m-2 p-3 bg-black/45 backdrop-blur-md rounded-md">
          <div className='dpname flex gap-3'>
            <div>
              <Image
                src={userInfo?.image || "/default-avatar.png"}
                alt={`${userInfo?.name}'s avatar`}
                width={60}
                height={50}
                className='rounded-full object-cover'
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className='text-2xl font-semibold'>
                {userInfo?.name}
              </span>
              <span>
                @{userInfo?.username}
              </span>
            </div>
          </div>
          {/* {watched.length && myself && <button className='p-3 w-fit bg-black/40 rounded-md' disabled={recommendationMode} onClick={()=>setRecommendationMode(true)}>
            Get recommendation
          </button> */}
          {recommendationMode ? <button className='p-3 w-fit bg-black/40 rounded-md text-gray-500' disabled={recommendationMode}>
            Get recommendation
          </button> : <button className='p-3 w-fit bg-black/40 rounded-md' onClick={()=>setRecommendationMode(true)}>
            Get recommendation
          </button>}
        </div>
        <div className="flex w-full">
          <div className='flex w-full m-2 p-3 bg-black/45 backdrop-blur-md rounded-md flex-col'>
            <div className='text-2xl font-semibold'>
              Stats
            </div>
            <div>Watched: {watched.length}</div>
          </div>
        </div>
      </div>
      {recommendationMode && <>
      <span className='text-2xl font-semibold m-2'>
          Recommendations
      </span>
      {recommendations.length == 0 && <div className='text-xl italic m-2'>
          Loading... Please wait for few seconds...
        </div>}
      <div className='cards flex flex-wrap gap-3 z-0 relative mx-1 md:mx-10 justify-center mb-10'>
          
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

      <div className='flex gap-2 m-2 flex-col'>
        <span className='text-2xl font-semibold'>
          Watched
        </span>
        <div className='flex flex-wrap gap-2 items-center justify-center'>
          {watched && watched.map((item, ind) => (
            // <div key={ind} className='group watchedcard border border-white/50 shadow-black rounded-xl p-3 w-40 md:w-[95%] cursor-pointer bg-black/50 backdrop-blur-2xl hover:border-4 hover:w-45 hover:md:w-full hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all flex gap-2'>
            <div key={ind} onClick={() => router.push("/anime/" + item.mal_id)} className='group watchedcard border border-white/50 shadow-black rounded-xl p-3 w-full md:w-[45%] h-50 hover:h-54 cursor-pointer bg-black/50 backdrop-blur-2xl hover:border-4 hover:w-full hover:md:w-[50%] hover:p-5 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all flex gap-2'>
              <div className="imagediv rounded-md">
                <img className='min-w-30 h-44 overflow-hidden rounded-md' src={item.image} alt="" srcSet="" />
              </div>
              <div className='contentdiv flex flex-col group w-full'>
                <span className='text-xl group-hover:text-2xl group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-yellow-400 group-hover:bg-clip-text group-hover:text-transparent transition-all text-ellipsis'>
                  {item.animename}
                </span>
                <span>
                  <span>Rated:</span> <span className='group-hover:bg-black/30 px-1 py-0.5 rounded-md group-hover:font-semibold group'><span className='bg-gradient-to-b bg-clip-text group-hover:text-transparent/10 from-blue-300 to-yellow-500'>{item.rating}</span></span>
                  <div className='h-[1px] mt-1 group-hover:bg-gradient-to-b group-hover:from-blue-300 group-hover:to-yellow-300 group-hover:h-[5px] bg-white w-full'></div>
                </span>
                {item.opinion ? <span className='overflow-auto h-full'>
                  {item.opinion}
                </span> : <span className='italic text-gray-400'>No opinion...</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Profile