import { recommendAnime } from "./check3.js";
const watched = {
    50265: [1, 46, 4], // Spy family
    269: [1, 2, 37],  // Bleach
    38000: [1, 46, 37], // Demon slayer
    42249: [1, 8], // Tokyo revenger
    5114: [1, 2, 8, 10], // FMAB
    40748: [1, 46, 37], // Jujutsu
    16496: [1, 46, 8, 41], // attack on titan
    38691: [2, 4, 24], // Dr. Stone
    11061: [1, 2, 10], //HxH
    48926: [4] // Komi San
}
const recc = await recommendAnime(watched)
console.log(recc)

console.log("ok now")
let recommendedInfoes = [];
for(const id of recc){
    const req = await fetch(`https://api.jikan.moe/v4/anime/${id}`)
    const reqJson = await req.json()
    if("data" in reqJson)
        recommendedInfoes.push(reqJson)
    await new Promise(resolve => setTimeout(resolve, 600))
}

console.log(recommendedInfoes, recommendedInfoes.length)