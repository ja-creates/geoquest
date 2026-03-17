/**
 * GeoQuest – Map Data Module
 * Country dataset with metadata for game logic and info popups.
 * SVG path IDs should match countryId values.
 */

'use strict';

/**
 * @typedef {Object} CountryData
 * @property {string} name       - Display name
 * @property {string} id         - SVG data-country attribute value
 * @property {string} capital    - Capital city
 * @property {string} continent  - Continent name
 * @property {string} flag       - Flag emoji
 * @property {string} difficulty - "easy" | "medium" | "hard"
 * @property {string[]} [hints]  - Optional hint strings
 */

/** @type {CountryData[]} */
const COUNTRY_DATA = [
  // ── EASY ──────────────────────────────────────────────────
  { name: "Brazil",         id: "BR", capital: "Brasília",      continent: "South America", flag: "🇧🇷", difficulty: "easy",   hints: ["Largest country in South America", "Home to the Amazon rainforest"] },
  { name: "United States",  id: "US", capital: "Washington D.C.",continent: "North America", flag: "🇺🇸", difficulty: "easy",   hints: ["Has 50 states", "Borders Canada and Mexico"] },
  { name: "Canada",         id: "CA", capital: "Ottawa",         continent: "North America", flag: "🇨🇦", difficulty: "easy",   hints: ["Second largest country by area", "Known for maple syrup"] },
  { name: "Russia",         id: "RU", capital: "Moscow",         continent: "Europe/Asia",   flag: "🇷🇺", difficulty: "easy",   hints: ["Largest country in the world", "Spans 11 time zones"] },
  { name: "China",          id: "CN", capital: "Beijing",        continent: "Asia",          flag: "🇨🇳", difficulty: "easy",   hints: ["Most populous country", "Has the Great Wall"] },
  { name: "Australia",      id: "AU", capital: "Canberra",       continent: "Oceania",       flag: "🇦🇺", difficulty: "easy",   hints: ["Only country that is also a continent", "Home to kangaroos"] },
  { name: "India",          id: "IN", capital: "New Delhi",      continent: "Asia",          flag: "🇮🇳", difficulty: "easy",   hints: ["Second most populous country", "Birthplace of yoga"] },
  { name: "Argentina",      id: "AR", capital: "Buenos Aires",   continent: "South America", flag: "🇦🇷", difficulty: "easy",   hints: ["Second largest in South America", "Famous for tango"] },
  { name: "Mexico",         id: "MX", capital: "Mexico City",    continent: "North America", flag: "🇲🇽", difficulty: "easy",   hints: ["Borders the US to the north", "Home of tacos and mariachi"] },
  { name: "France",         id: "FR", capital: "Paris",          continent: "Europe",        flag: "🇫🇷", difficulty: "easy",   hints: ["Home of the Eiffel Tower", "Famous for wine and cuisine"] },
  { name: "Germany",        id: "DE", capital: "Berlin",         continent: "Europe",        flag: "🇩🇪", difficulty: "easy",   hints: ["Largest economy in Europe", "Known for Oktoberfest"] },
  { name: "Japan",          id: "JP", capital: "Tokyo",          continent: "Asia",          flag: "🇯🇵", difficulty: "easy",   hints: ["Island nation in East Asia", "Famous for sushi and anime"] },
  { name: "Egypt",          id: "EG", capital: "Cairo",          continent: "Africa",        flag: "🇪🇬", difficulty: "easy",   hints: ["Home of the ancient pyramids", "Has the Nile River"] },
  { name: "South Africa",   id: "ZA", capital: "Pretoria",       continent: "Africa",        flag: "🇿🇦", difficulty: "easy",   hints: ["Southernmost country in Africa", "Three capital cities"] },
  { name: "Nigeria",        id: "NG", capital: "Abuja",          continent: "Africa",        flag: "🇳🇬", difficulty: "easy",   hints: ["Most populous country in Africa", "Largest economy in Africa"] },
  { name: "Italy",          id: "IT", capital: "Rome",           continent: "Europe",        flag: "🇮🇹", difficulty: "easy",   hints: ["Shaped like a boot", "Home of pasta and pizza"] },
  { name: "Spain",          id: "ES", capital: "Madrid",         continent: "Europe",        flag: "🇪🇸", difficulty: "easy",   hints: ["Iberian Peninsula", "Famous for flamenco and bullfighting"] },
  { name: "United Kingdom", id: "GB", capital: "London",         continent: "Europe",        flag: "🇬🇧", difficulty: "easy",   hints: ["Island nation in northwest Europe", "Home of Big Ben"] },
  { name: "Saudi Arabia",   id: "SA", capital: "Riyadh",         continent: "Asia",          flag: "🇸🇦", difficulty: "easy",   hints: ["Largest country in Middle East", "Largest oil exporter"] },
  { name: "Indonesia",      id: "ID", capital: "Jakarta",        continent: "Asia",          flag: "🇮🇩", difficulty: "easy",   hints: ["Largest archipelago in the world", "Home to Bali"] },

  // ── MEDIUM ────────────────────────────────────────────────
  { name: "Colombia",       id: "CO", capital: "Bogotá",         continent: "South America", flag: "🇨🇴", difficulty: "medium", hints: ["Named after Christopher Columbus", "Top coffee producer"] },
  { name: "Peru",           id: "PE", capital: "Lima",           continent: "South America", flag: "🇵🇪", difficulty: "medium", hints: ["Home of Machu Picchu", "Amazon river begins here"] },
  { name: "Venezuela",      id: "VE", capital: "Caracas",        continent: "South America", flag: "🇻🇪", difficulty: "medium", hints: ["Largest oil reserves in the world", "Angel Falls is here"] },
  { name: "Chile",          id: "CL", capital: "Santiago",       continent: "South America", flag: "🇨🇱", difficulty: "medium", hints: ["Long thin country", "Shares Andes with Argentina"] },
  { name: "Turkey",         id: "TR", capital: "Ankara",         continent: "Europe/Asia",   flag: "🇹🇷", difficulty: "medium", hints: ["Spans two continents", "Istanbul is its largest city"] },
  { name: "Iran",           id: "IR", capital: "Tehran",         continent: "Asia",          flag: "🇮🇷", difficulty: "medium", hints: ["Ancient Persian Empire", "Borders Iraq and Afghanistan"] },
  { name: "Pakistan",       id: "PK", capital: "Islamabad",      continent: "Asia",          flag: "🇵🇰", difficulty: "medium", hints: ["5th most populous country", "K2 mountain is here"] },
  { name: "Ukraine",        id: "UA", capital: "Kyiv",           continent: "Europe",        flag: "🇺🇦", difficulty: "medium", hints: ["Largest country entirely in Europe", "Famous for sunflowers"] },
  { name: "Poland",         id: "PL", capital: "Warsaw",         continent: "Europe",        flag: "🇵🇱", difficulty: "medium", hints: ["Largest country in Central Europe", "Borders Germany and Russia"] },
  { name: "Ethiopia",       id: "ET", capital: "Addis Ababa",    continent: "Africa",        flag: "🇪🇹", difficulty: "medium", hints: ["Most populous landlocked country", "Home of coffee origin"] },
  { name: "Kenya",          id: "KE", capital: "Nairobi",        continent: "Africa",        flag: "🇰🇪", difficulty: "medium", hints: ["Famous for safari and wildlife", "Straddles the equator"] },
  { name: "Tanzania",       id: "TZ", capital: "Dodoma",         continent: "Africa",        flag: "🇹🇿", difficulty: "medium", hints: ["Home of Mount Kilimanjaro", "Zanzibar island is here"] },
  { name: "Morocco",        id: "MA", capital: "Rabat",          continent: "Africa",        flag: "🇲🇦", difficulty: "medium", hints: ["Northernmost country in Africa", "Borders the Sahara"] },
  { name: "Ghana",          id: "GH", capital: "Accra",          continent: "Africa",        flag: "🇬🇭", difficulty: "medium", hints: ["First sub-Saharan country to gain independence", "Famous cacao producer"] },
  { name: "Sweden",         id: "SE", capital: "Stockholm",      continent: "Europe",        flag: "🇸🇪", difficulty: "medium", hints: ["Scandinavia", "Land of IKEA and ABBA"] },
  { name: "Norway",         id: "NO", capital: "Oslo",           continent: "Europe",        flag: "🇳🇴", difficulty: "medium", hints: ["Famous for fjords", "Midnight sun in summer"] },
  { name: "Vietnam",        id: "VN", capital: "Hanoi",          continent: "Asia",          flag: "🇻🇳", difficulty: "medium", hints: ["S-shaped country in Southeast Asia", "Famous for Phở"] },
  { name: "Thailand",       id: "TH", capital: "Bangkok",        continent: "Asia",          flag: "🇹🇭", difficulty: "medium", hints: ["Land of Smiles", "Never colonized in Southeast Asia"] },
  { name: "South Korea",    id: "KR", capital: "Seoul",          continent: "Asia",          flag: "🇰🇷", difficulty: "medium", hints: ["Korean Peninsula south", "K-pop originates here"] },
  { name: "Malaysia",       id: "MY", capital: "Kuala Lumpur",   continent: "Asia",          flag: "🇲🇾", difficulty: "medium", hints: ["Southeast Asia, Borneo and mainland", "Petronas Towers"] },

  // ── HARD ──────────────────────────────────────────────────
  { name: "Bolivia",        id: "BO", capital: "Sucre",          continent: "South America", flag: "🇧🇴", difficulty: "hard",   hints: ["Landlocked in South America", "World's highest capital city"] },
  { name: "Paraguay",       id: "PY", capital: "Asunción",       continent: "South America", flag: "🇵🇾", difficulty: "hard",   hints: ["Landlocked between Brazil and Argentina", "Guaraní is co-official language"] },
  { name: "Uruguay",        id: "UY", capital: "Montevideo",     continent: "South America", flag: "🇺🇾", difficulty: "hard",   hints: ["Smallest Spanish-speaking country in South America", "Borders Brazil and Argentina"] },
  { name: "Ecuador",        id: "EC", capital: "Quito",          continent: "South America", flag: "🇪🇨", difficulty: "hard",   hints: ["Named after the equator", "Galápagos Islands are here"] },
  { name: "Sudan",          id: "SD", capital: "Khartoum",       continent: "Africa",        flag: "🇸🇩", difficulty: "hard",   hints: ["Nile River runs through it", "Borders Egypt to the north"] },
  { name: "Angola",         id: "AO", capital: "Luanda",         continent: "Africa",        flag: "🇦🇴", difficulty: "hard",   hints: ["Portuguese-speaking", "On Atlantic coast of southern Africa"] },
  { name: "Mozambique",     id: "MZ", capital: "Maputo",         continent: "Africa",        flag: "🇲🇿", difficulty: "hard",   hints: ["Portuguese-speaking", "East coast of southern Africa"] },
  { name: "Zambia",         id: "ZM", capital: "Lusaka",         continent: "Africa",        flag: "🇿🇲", difficulty: "hard",   hints: ["Victoria Falls is here", "Landlocked in southern Africa"] },
  { name: "Romania",        id: "RO", capital: "Bucharest",      continent: "Europe",        flag: "🇷🇴", difficulty: "hard",   hints: ["Romania, land of Dracula's Transylvania", "Borders Ukraine and Bulgaria"] },
  { name: "Czech Republic", id: "CZ", capital: "Prague",         continent: "Europe",        flag: "🇨🇿", difficulty: "hard",   hints: ["Also called Czechia", "Landlocked in Central Europe"] },
  { name: "Hungary",        id: "HU", capital: "Budapest",       continent: "Europe",        flag: "🇭🇺", difficulty: "hard",   hints: ["On the Danube River", "Landlocked in Central Europe"] },
  { name: "Kazakhstan",     id: "KZ", capital: "Astana",         continent: "Asia",          flag: "🇰🇿", difficulty: "hard",   hints: ["Largest landlocked country", "9th largest country overall"] },
  { name: "Uzbekistan",     id: "UZ", capital: "Tashkent",       continent: "Asia",          flag: "🇺🇿", difficulty: "hard",   hints: ["Doubly landlocked in Central Asia", "Ancient Silk Road cities"] },
  { name: "Myanmar",        id: "MM", capital: "Naypyidaw",      continent: "Asia",          flag: "🇲🇲", difficulty: "hard",   hints: ["Formerly Burma", "Southeast Asia, borders India and China"] },
  { name: "Nepal",          id: "NP", capital: "Kathmandu",      continent: "Asia",          flag: "🇳🇵", difficulty: "hard",   hints: ["Home of Mount Everest", "Landlocked between India and China"] },
  { name: "Afghanistan",    id: "AF", capital: "Kabul",          continent: "Asia",          flag: "🇦🇫", difficulty: "hard",   hints: ["Landlocked in Central/South Asia", "Borders Pakistan and Iran"] },
  { name: "New Zealand",    id: "NZ", capital: "Wellington",     continent: "Oceania",       flag: "🇳🇿", difficulty: "hard",   hints: ["Two main islands in Pacific", "Land of the Kiwi"] },
  { name: "Iraq",           id: "IQ", capital: "Baghdad",        continent: "Asia",          flag: "🇮🇶", difficulty: "hard",   hints: ["Ancient Mesopotamia", "Tigris and Euphrates rivers"] },
  { name: "Syria",          id: "SY", capital: "Damascus",       continent: "Asia",          flag: "🇸🇾", difficulty: "hard",   hints: ["One of the oldest inhabited cities", "Borders Turkey and Iraq"] },
  { name: "Finland",        id: "FI", capital: "Helsinki",       continent: "Europe",        flag: "🇫🇮", difficulty: "hard",   hints: ["Land of a thousand lakes", "Borders Russia and Sweden"] },
];

/**
 * Country lookup map by ID for O(1) access
 * @type {Map<string, CountryData>}
 */
const COUNTRY_MAP = new Map(COUNTRY_DATA.map(c => [c.id, c]));

/**
 * Get countries filtered by difficulty tier (cumulative)
 * @param {string} difficulty - "easy" | "medium" | "hard"
 * @returns {CountryData[]}
 */
function getCountriesByDifficulty(difficulty) {
  const tiers = {
    easy:   ['easy'],
    medium: ['easy', 'medium'],
    hard:   ['easy', 'medium', 'hard'],
  };
  const allowed = tiers[difficulty] || tiers.easy;
  return COUNTRY_DATA.filter(c => allowed.includes(c.difficulty));
}

/**
 * Fisher-Yates shuffle
 * @param {Array} arr
 * @returns {Array} new shuffled array
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick N unique random countries
 * @param {number} count
 * @param {string} difficulty
 * @returns {CountryData[]}
 */
function pickRandomCountries(count, difficulty = 'easy') {
  const pool = getCountriesByDifficulty(difficulty);
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}
