class SearchSystem {
  constructor(data, { searchType = 'exact', supportNumbers = false } = {}) {
    this.data = data; // Array of objects to search in
    this.searchType = searchType; // 'prefix', 'exact', 'substring'
    this.supportNumbers = supportNumbers; // Boolean flag to support number-based searches
    
    // Initializing the structures based on the search type
    this.trie = null;
    this.invertedIndex = null;
    this.substringIndex = null;
    
    this.initializeSearchStructures();
  }

  // Utility method to check if a string can be interpreted as a number
  static isNumber(value) {
    return !isNaN(value) && value !== '';
  }

  // Normalize search term to handle number and string cases
  normalizeSearchTerm(searchTerm) {
    if (this.supportNumbers && SearchSystem.isNumber(searchTerm)) {
      return Number(searchTerm);
    }
    return searchTerm.toLowerCase(); // Default to lowercased string
  }

  // Initialize search structures based on search type
  initializeSearchStructures() {
    if (this.searchType === 'prefix') {
      this.trie = new Trie(); // Initialize Trie for prefix search
      this.data.forEach(item => {
        Object.values(item).forEach(value => {
          if (typeof value === 'string') {
            this.trie.insert(value.toLowerCase(), item);
          }
        });
      });
    } else if (this.searchType === 'exact') {
      this.invertedIndex = this.createInvertedIndex(); // Create inverted index for exact search
    } else if (this.searchType === 'substring') {
      this.substringIndex = this.data; // Use array-based search for substring matching
    }
  }

  // Reset all search structures to free memory
  reset() {
    this.trie = null;
    this.invertedIndex = null;
    this.substringIndex = null;
    console.log('Search structures have been reset.');
  }

  // Prefix search using Trie
  prefixSearch(searchTerm) {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);
    return this.trie ? this.trie.search(normalizedTerm) : [];
  }

  // Exact match search using Inverted Index
  exactSearch(searchTerm) {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);
    return this.invertedIndex ? this.invertedIndex[normalizedTerm] || [] : [];
  }

  // Substring search using Array-based filtering
  substringSearch(searchTerm) {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);
    return this.substringIndex ? this.substringIndex.filter(obj =>
      Object.values(obj).some(value => {
        const normalizedValue = value.toString().toLowerCase();
        return normalizedValue.includes(normalizedTerm);
      })
    ) : [];
  }

  // Main search function based on the searchType
  search(searchTerm) {
    switch (this.searchType) {
      case 'prefix':
        return this.prefixSearch(searchTerm);
      case 'substring':
        return this.substringSearch(searchTerm);
      case 'exact':
      default:
        return this.exactSearch(searchTerm);
    }
  }

  // Create inverted index for exact search
  createInvertedIndex() {
    const invertedIndex = {};
    this.data.forEach((item) => {
      Object.values(item).forEach(value => {
        const normalizedValue = value.toString().toLowerCase();
        if (!invertedIndex[normalizedValue]) {
          invertedIndex[normalizedValue] = [];
        }
        invertedIndex[normalizedValue].push(item); // Store full object
      });
    });
    return invertedIndex;
  }
}

// Optimized Trie Data Structure for Prefix Search
class Trie {
  constructor() {
    this.root = {};
  }

  insert(word, object) {
    let node = this.root;
    for (let char of word) {
      if (!node[char]) {
        node[char] = {};
      }
      node = node[char];
    }
    // Store a reference to the matching object at the end of the word path
    if (!node.isEndOfWord) {
      node.isEndOfWord = true;
      node.objects = [];
    }
    node.objects.push(object); // Store the reference to the object
  }

  search(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node[char]) {
        return []; // No match found for this prefix
      }
      node = node[char];
    }

    // Collect all matching objects from this node onward
    return this.collectObjects(node);
  }

  collectObjects(node) {
    let objects = [];
    if (node.isEndOfWord) {
      objects = objects.concat(node.objects); // Add objects stored at this node
    }

    for (let char in node) {
      if (char !== 'isEndOfWord' && char !== 'objects') {
        objects = objects.concat(this.collectObjects(node[char])); // Recursive search
      }
    }

    return objects;
  }
}

// Example Usage

function generateLargeDataset(size) {
  const data = [];
  const names = ["Alice Johnson", "Bob Smith", "Charlie Brown", "David Wilson"];
  const descriptions = [
    "Software developer", 
    "Data scientist", 
    "Frontend engineer", 
    "Backend developer"
  ];
  
  for (let i = 0; i < size; i++) {
    data.push({
      id: i + 1,
      name: names[i % names.length],
      description: descriptions[i % descriptions.length]
    });
  }
  return data;
}

// Create a large dataset of 10,000 entries
const data = generateLargeDataset(100000);

// Prefix search
const prefixSearch = new SearchSystem(data, { searchType: 'prefix' });
console.time('Trie Prefix Search');
console.log(prefixSearch.search('ob smith').length); // Prefix search: Returns objects containing "banana"
console.timeEnd('Trie Prefix Search');

// Exact search (Inverted Index)
const exactSearch = new SearchSystem(data, { searchType: 'exact' });
console.time('Exact Search');
console.log(exactSearch.search('ob smith').length); // Exact search: Returns objects matching exactly "banana"
console.timeEnd('Exact Search');

// Substring search (Array-based)
const substringSearch = new SearchSystem(data, { searchType: 'substring' });
console.time('Substring Search');
console.log(substringSearch.search('ob smith').length); // Substring search: Returns all objects containing "fruit"
console.timeEnd('Substring Search');

// Reset all structures to avoid memory leak
// prefixSearch.reset(); // This will reset all search structures
