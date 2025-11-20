import { Apriori } from "./apriori.js";


// Fetch ALL anime for a given genre combination from Jikan (paginate)
async function fetchAllAnimeByGenres(genres) {
    const allAnime = [];
    const genreParam = genres.join(",");
    let page = 1;

    while (true) {
        const url = `https://api.jikan.moe/v4/anime?genres=${genreParam}&order_by=score&sort=desc&page=${page}&limit=25`;
        const res = await fetch(url);
        // await new Promise(resolve => setTimeout(resolve, 400));
        const data = await res.json();

        if (!data.data || data.data.length === 0) break;

        allAnime.push(...data.data);

        if (!data.pagination?.has_next_page) break;

        page++;
    }

    return allAnime;
}



// =========================
// MAIN RECOMMEND FUNCTION
// =========================
export async function recommendAnime(watched) {

    // Step 1: Prepare transactions
    const transactions = Object.values(watched);

    // Step 2: Run Apriori
    const apriori = new Apriori(0.3);
    const { itemsets } = await apriori.exec(transactions);

    // Step 3: Sort itemsets (bigger → smaller, then support)
    itemsets.sort((a, b) => {
        if (b.items.length !== a.items.length)
            return b.items.length - a.items.length;
        return b.support - a.support;
    });


    // Step 4: Setup sets
    console.log("These are watched", watched)
    const watchedAndRecommended = new Set(Object.keys(watched).map(Number));
    const recommended = new Set();


    // Step 5: Iterate sorted itemsets
    for (const set of itemsets) {
        const genres = set.items;     // e.g. [1, 46]

        // Fetch ALL anime that match this combination
        const animeList = await fetchAllAnimeByGenres(genres);

        let addedCount = 0;

        for (const anime of animeList) {
            if (addedCount >= 5) break;

            const malId = anime.mal_id;

            if (!watchedAndRecommended.has(malId)) {
                watchedAndRecommended.add(malId);
                recommended.add(malId);
                addedCount++;

                // Stop EVERYTHING once we reach 20
                if (recommended.size >= 25) {
                    return [...recommended];
                }
            }
        }
    }

    return [...recommended];
}