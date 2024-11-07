const cityImages = {
  "Paris": [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "https://images.unsplash.com/photo-1431274172761-fca41d930114",
    "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f"
  ],
  "London": [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd",
    "https://images.unsplash.com/photo-1520967824495-b529adc3ba69"
  ],
  "Rome": [
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b",
    "https://images.unsplash.com/photo-1525874684015-58379d421a52"
  ],
  "default": [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
    "https://images.unsplash.com/photo-1508672019048-805c876b67e2"
  ]
};

export async function getRandomCityImage(location: string): Promise<string> {
  const normalizedLocation = location.split(',')[0].trim();
  const images = cityImages[normalizedLocation] || cityImages.default;
  const randomIndex = Math.floor(Math.random() * images.length);
  return `${images[randomIndex]}?auto=format&fit=crop&q=80`;
}