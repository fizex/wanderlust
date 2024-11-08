const CITY_IMAGES = {
  "sydney": [
    "photo-1506973035872-a4ec16b8e8d9", // Sydney Opera House
    "photo-1506973035872-a4ec16b8e8d9", // Harbour Bridge
    "photo-1523482580672-f109ba8cb9be"  // Sydney Skyline
  ],
  "melbourne": [
    "photo-1514395462725-fb4566210144", // Federation Square
    "photo-1598573530452-8f30ec6eb0cc", // Melbourne Laneways
    "photo-1545044846-351ba102b6d5"  // Melbourne Skyline
  ],
  "brisbane": [
    "photo-1572931089826-c8a6b9a0559c", // Brisbane Skyline
    "photo-1598572500335-5d75c5c6e524", // Story Bridge
    "photo-1599476505006-b468d0d37c8a"  // South Bank
  ],
  "perth": [
    "photo-1588271670197-cbd55e1d9db1", // Perth Skyline
    "photo-1567610029003-80428902b916", // Elizabeth Quay
    "photo-1578323851363-383f029a0db9"  // Kings Park
  ],
  "adelaide": [
    "photo-1576646839139-bb763d074a97", // Adelaide Oval
    "photo-1576647115339-7e8178ead0ef", // City Center
    "photo-1589195950088-5c96ec8b9f17"  // Glenelg Beach
  ],
  "gold coast": [
    "photo-1572931089826-c8a6b9a0559c", // Surfers Paradise
    "photo-1506973035872-a4ec16b8e8d9", // Beach
    "photo-1523482580672-f109ba8cb9be"  // Skyline
  ],
  "blue mountains": [
    "photo-1572931089826-c8a6b9a0559c", // Three Sisters
    "photo-1506973035872-a4ec16b8e8d9", // Scenic World
    "photo-1523482580672-f109ba8cb9be"  // Valley View
  ],
  "default": [
    "photo-1523482580672-f109ba8cb9be", // Uluru
    "photo-1529108190281-9a4f620bc2d8", // Great Barrier Reef
    "photo-1506973035872-a4ec16b8e8d9"  // Sydney Opera House
  ]
};

export async function getRandomCityImage(location: string): Promise<string> {
  const normalizedLocation = location.toLowerCase().split(',')[0].trim();
  const images = CITY_IMAGES[normalizedLocation] || CITY_IMAGES.default;
  const randomIndex = Math.floor(Math.random() * images.length);
  return `https://images.unsplash.com/${images[randomIndex]}?auto=format&fit=crop&q=80&w=1920`;
}