class Apriori {
  constructor(minSupport = 0.5) {
    this.minSupport = minSupport;
    this._listeners = {};
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, value) {
    const list = this._listeners[event] || [];
    for (const cb of list) cb(value);
  }

  // Basic Apriori implementation: find frequent itemsets of all sizes.
  async exec(transactions) {
    const start = Date.now();
    const total = transactions.length;
    let frequentItemsets = [];
    let k = 1;

    // Helper to generate combinations
    const combinations = (arr, r) => {
      if (r === 0) return [[]];
      if (arr.length === 0) return [];
      const [first, ...rest] = arr;
      const withFirst = combinations(rest, r - 1).map(comb => [first, ...comb]);
      const withoutFirst = combinations(rest, r);
      return [...withFirst, ...withoutFirst];
    };

    // Helper to check if itemset is subset of transaction
    const isSubset = (itemset, transaction) => itemset.every(item => transaction.includes(item));

    // Start with 1-itemsets
    const itemCounts = new Map();
    for (const tx of transactions) {
      for (const item of tx) {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      }
    }
    let candidates = Array.from(itemCounts.keys()).map(item => [item]);

    while (candidates.length > 0) {
      const newFrequent = [];
      for (const candidate of candidates) {
        const count = transactions.filter(tx => isSubset(candidate, tx)).length;
        const support = count / total;
        if (support >= this.minSupport) {
          const itemset = { items: candidate, support };
          setImmediate(() => this._emit('data', itemset));
          newFrequent.push(itemset);
        }
      }
      if (newFrequent.length === 0) break;
      frequentItemsets.push(...newFrequent);

      // Generate next candidates (k+1)
      const uniqueItems = Array.from(new Set(frequentItemsets.flatMap(is => is.items))).sort();
      candidates = combinations(uniqueItems, k + 1);
      k++;
    }

    const executionTime = Date.now() - start;
    return { itemsets: frequentItemsets, executionTime };
  }
}

async function fetchAllAnimeByGenres(genres) {
  const allAnime = [];
  const genreParam = genres.join(",");
  let page = 1;

  while (true) {
    const url = `https://api.jikan.moe/v4/anime?genres=${genreParam}&order_by=popularity&page=${page}&limit=25`;
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
  const txnCount = transactions.length;

  // Keep noisy tiny histories strict and loosen as evidence grows.
  const pickMinSupport = (count) => {
    if (count <= 10) return 0.25;
    if (count <= 25) return 0.3;
    if (count <= 50) return 0.4;
    if (count <= 100) return 0.5;
    return 0.6
  };
  const dynamicSupport = pickMinSupport(txnCount);

  // Step 2: Run Apriori
  const apriori = new Apriori(dynamicSupport);
  const { itemsets } = await apriori.exec(transactions);

  // Step 3: Sort itemsets (bigger → smaller, then support)
  itemsets.sort((a, b) => {
    if (b.items.length !== a.items.length)
      return b.items.length - a.items.length;
    return b.support - a.support;
  });
  console.log("Frequent itemsets: ", itemsets)


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
      if (addedCount >= 7) break;

      const malId = anime.mal_id;

      if (!watchedAndRecommended.has(malId)) {
        watchedAndRecommended.add(malId);
        recommended.add(malId);
        addedCount++;

        // Stop EVERYTHING once we reach 25
        if (recommended.size >= 28) {
          return [...recommended];
        }
      }
    }
  }

  return [...recommended];
}

export async function POST(request) {
  const watched = await request.json();
  console.log("Watched", watched)
  const recc = await recommendAnime(watched)
  let recommendedInfoes = [];
  for (const id of recc) {
    let req = await fetch(`https://api.jikan.moe/v4/anime/${id}`)
    let reqJson = await req.json()
    // while(!("data" in reqJson)){
    //   req = await fetch(`https://api.jikan.moe/v4/anime/${id}`)
    //   reqJson = await req.json()
    // }
    if('data' in reqJson)
      recommendedInfoes.push(reqJson['data'])
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  // console.log("Recommended infoes", recommendedInfoes)
  console.log("Recommended length", recommendedInfoes.length)
  return Response.json({ message: recommendedInfoes, error: false, success: true });
}