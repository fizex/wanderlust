export const REGIONS = {
  africa: {
    name: 'Africa',
    searchTerm: 'african landscape culture architecture safari'
  },
  asia: {
    name: 'Asia',
    searchTerm: 'asian architecture temples culture landscape'
  },
  europe: {
    name: 'Europe',
    searchTerm: 'european architecture landmarks cities culture'
  },
  oceania: {
    name: 'Oceania',
    searchTerm: 'oceania pacific islands beaches nature'
  },
  north_america: {
    name: 'North America',
    searchTerm: 'north american landmarks cities nature'
  },
  south_america: {
    name: 'South America',
    searchTerm: 'south american landmarks andes culture'
  }
} as const;

export type Region = keyof typeof REGIONS;

// Map of countries to their regions
export const COUNTRY_TO_REGION: Record<string, Region> = {
  'afghanistan': 'asia',
  'albania': 'europe',
  'algeria': 'africa',
  // ... Add all countries
  'zimbabwe': 'africa'
};

// Common country name variations and aliases
export const COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'united states',
  'uk': 'united kingdom',
  'uae': 'united arab emirates',
  // ... Add common aliases
};