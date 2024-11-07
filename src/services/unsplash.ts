const COUNTRY_IMAGES = {
  'united states': [
    'photo-1485871981521-5b1fd3805eee', // New York skyline
    'photo-1501466044931-62695aada8e9', // Golden Gate Bridge
    'photo-1495344517868-8ebaf0a2044a'  // Grand Canyon
  ],
  'france': [
    'photo-1502602898657-3e91760cbb34', // Eiffel Tower
    'photo-1499856871958-5b9627545d1a', // Paris Architecture
    'photo-1520939817895-060bdaf4fe1b'  // French Riviera
  ],
  'italy': [
    'photo-1552832230-c0197dd311b5',    // Rome Colosseum
    'photo-1523906834658-6e24ef2386f9', // Venice Canals
    'photo-1534445867742-43195f401b6c'  // Tuscany Landscape
  ],
  'spain': [
    'photo-1539037116277-4db20889f2d4', // Barcelona
    'photo-1511527661048-7fe73d85e9a4', // Madrid
    'photo-1512753360435-329c4535a9a7'  // Seville
  ],
  'japan': [
    'photo-1492571350019-22de08371fd3', // Mount Fuji
    'photo-1528360983277-13d401cdc186', // Tokyo Tower
    'photo-1493976040374-85c8e12f0c0e'  // Kyoto Temple
  ],
  'australia': [
    'photo-1506973035872-a4ec16b8e8d9', // Sydney Opera House
    'photo-1523482580672-f109ba8cb9be', // Uluru
    'photo-1529108190281-9a4f620bc2d8'  // Great Barrier Reef
  ],
  'united kingdom': [
    'photo-1513635269975-59663e0ac1ad', // London
    'photo-1486299267070-83823f5448dd', // Big Ben
    'photo-1488747279002-c8523379faaa'  // Edinburgh Castle
  ],
  'germany': [
    'photo-1467269204594-9661b134dd2b', // Neuschwanstein Castle
    'photo-1528728329032-2972f65dfb3f', // Berlin Brandenburg Gate
    'photo-1534313314376-a72289b6181e'  // Bavarian Alps
  ],
  'china': [
    'photo-1508804185872-d7badad00f7d', // Great Wall
    'photo-1474181487882-5abf3f0ba6c2', // Shanghai Skyline
    'photo-1547981609-4b6bfe67ca0b'  // Beijing Temple
  ]
};

// Common country name variations and aliases
const COUNTRY_ALIASES = {
  'usa': 'united states',
  'us': 'united states',
  'america': 'united states',
  'uk': 'united kingdom',
  'england': 'united kingdom',
  'britain': 'united kingdom',
  'great britain': 'united kingdom',
  'deutschland': 'germany',
  'nippon': 'japan',
  'italia': 'italy',
  'españa': 'spain'
};

const DEFAULT_IMAGES = [
  'photo-1476514525535-07fb3b4ae5f1', // Scenic Mountain Lake
  'photo-1469854523086-cc02fe5d8800', // Airplane Wing Sunset
  'photo-1508672019048-805c876b67e2', // Beach Paradise
  'photo-1530521954074-e64f6810b32d', // Ancient Architecture
  'photo-1528127269322-539801943592'  // Cultural Festival
];

export function getCountryImage(country: string): string {
  if (!country) {
    return `https://images.unsplash.com/${DEFAULT_IMAGES[0]}?auto=format&fit=crop&q=80&w=1920`;
  }

  // Normalize the country name
  const normalizedCountry = country.toLowerCase().trim();
  
  // Check for aliases first
  const resolvedCountry = COUNTRY_ALIASES[normalizedCountry as keyof typeof COUNTRY_ALIASES] || normalizedCountry;

  // Get images for the country
  const countryImages = COUNTRY_IMAGES[resolvedCountry as keyof typeof COUNTRY_IMAGES];
  
  if (countryImages) {
    const randomImage = countryImages[Math.floor(Math.random() * countryImages.length)];
    return `https://images.unsplash.com/${randomImage}?auto=format&fit=crop&q=80&w=1920`;
  }

  // If no country match, return a random default travel image
  const randomDefault = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
  return `https://images.unsplash.com/${randomDefault}?auto=format&fit=crop&q=80&w=1920`;
}