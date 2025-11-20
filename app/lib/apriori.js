// Standalone Apriori implementation for finding frequent itemsets.
// This is a basic implementation of the Apriori algorithm.
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        console.log("This code is running in a browser environment.");
    }

export class Apriori {
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

export default { Apriori };