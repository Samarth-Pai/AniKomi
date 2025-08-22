import React from 'react'
import { useRouter } from 'next/navigation'
const capitalizeString = (s) => s[0].toUpperCase() + s.slice(1, s.length)

const Hero = () => {
  const router = useRouter()
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  let seasonsToBeDisplayed = []
  if([1, 2, 3].includes(currentMonth)){
    seasonsToBeDisplayed = [["fall", currentYear-1], ["winter", currentYear], ["spring", currentYear]]
  }
  else if([4, 5, 6].includes(currentMonth)){
    seasonsToBeDisplayed = [["winter", currentYear], ["spring", currentYear], ["summer", currentYear]]
  }
  else if([7, 8, 9].includes(currentMonth)){
    seasonsToBeDisplayed = [["spring", currentYear], ["summer", currentYear], ["fall", currentYear]]
  }
  else{
    seasonsToBeDisplayed = [["summer", currentYear], ["fall", currentYear], ["winter", currentYear + 1]]
  }
  return (
    <div className={"bg-[url('/street.jpg')] h-[80vh] bg-bottom relative flex flex-col pt-20 justify-center items-center px-[10vw]"}>
        {/* <div className='absolute bottom-0'>she</div> */}
        <div className="absolute bottom-[0] left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        <div className='text-5xl font-bold text-shadow-md text-shadow-black'>Explore anime based on your interest!</div>
        <div className='buttons flex gap-3 m-3 justify-center items-center'>
          {seasonsToBeDisplayed.map((item, ind) => {
            return <button key={ind} className='p-3 border border-white/50 bg-black/50 rounded-xl backdrop-blur-sm cursor-pointer hover:p-4 hover:border-4 hover:bg-gradient-to-tr hover:from-blue-800/50 hover:to-yellow-800/50 transition-all' onClick={() => router.push(`seasonal?season=${item[0]}&year=${item[1]}`)}>
              {capitalizeString(item[0])} {item[1]}
            </button>
          })}
        </div>
    </div>
  )
}

export default Hero