// Mock data för Office Oracle prototyp

export interface Office {
  id: string;
  address: string;
  area: string;
  city: string;
  sqm: number;
  rooms: number;
  estimatedRent: number;
  rentMin: number;
  rentMax: number;
  rentPerSqm: number;
  type: 'office' | 'retail' | 'warehouse' | 'flex';
  culture: 'modern' | 'traditional' | 'industrial' | 'flexible';
  priceLevel: 'budget' | 'standard' | 'premium';
  verified: boolean;
  newlyRenovated: boolean;
  flexibleContract: boolean;
  amenities: string[];
  images: string[];
  description: string;
  lat: number;
  lng: number;
  matchScore?: number;
  metroDistance: number; // minuter
  restaurantRating: number; // 1-5
  greenSpaceRating: number; // 1-5
  buildingYear: number;
  owner: string;
  nearbyCompanies: string[];
  areaRentAverage: number;
  rentVsAverage: number; // procent över/under genomsnitt
}

export interface AreaStats {
  name: string;
  city: string;
  avgRentPerSqm: number;
  yearChange: number;
  trend: 'up' | 'down' | 'stable';
  totalListings: number;
  lat: number;
  lng: number;
}

export interface RentHistoryPoint {
  month: string;
  rent: number;
}

export const offices: Office[] = [
  {
    id: '1',
    address: 'Sveavägen 42',
    area: 'Norrmalm',
    city: 'Stockholm',
    sqm: 250,
    rooms: 8,
    estimatedRent: 62500,
    rentMin: 58000,
    rentMax: 67000,
    rentPerSqm: 250,
    type: 'office',
    culture: 'modern',
    priceLevel: 'premium',
    verified: true,
    newlyRenovated: true,
    flexibleContract: true,
    amenities: ['Pentry', 'Dusch', 'Fiber', 'Gym', 'Reception', 'Balkong'],
    images: ['/images/office1.jpg', '/images/office1-2.jpg'],
    description: 'Ljust och modernt kontorslandskap i hjärtat av Stockholm. Nyrenoverat 2024 med högsta standard. Perfekt för techbolag som vill vara centralt.',
    lat: 59.3387,
    lng: 18.0552,
    metroDistance: 2,
    restaurantRating: 5,
    greenSpaceRating: 3,
    buildingYear: 1965,
    owner: 'Vasakronan',
    nearbyCompanies: ['Spotify', 'Klarna', 'TechStartup AB'],
    areaRentAverage: 275,
    rentVsAverage: -9
  },
  {
    id: '2',
    address: 'Hornsgatan 82',
    area: 'Södermalm',
    city: 'Stockholm',
    sqm: 120,
    rooms: 4,
    estimatedRent: 33600,
    rentMin: 30000,
    rentMax: 37000,
    rentPerSqm: 280,
    type: 'office',
    culture: 'modern',
    priceLevel: 'standard',
    verified: true,
    newlyRenovated: false,
    flexibleContract: true,
    amenities: ['Pentry', 'Fiber', 'Cykelparkering', 'Terrass'],
    images: ['/images/office2.jpg'],
    description: 'Kreativt kontor i populärt läge på Södermalm. Perfekt för mindre team eller byråer som uppskattar den lokala atmosfären.',
    lat: 59.3171,
    lng: 18.0494,
    metroDistance: 4,
    restaurantRating: 5,
    greenSpaceRating: 4,
    buildingYear: 1920,
    owner: 'Einar Mattsson',
    nearbyCompanies: ['Designbyrå X', 'PR-byrå Y', 'Kafé Z'],
    areaRentAverage: 295,
    rentVsAverage: -5
  },
  {
    id: '3',
    address: 'Isafjordsgatan 15',
    area: 'Kista',
    city: 'Stockholm',
    sqm: 450,
    rooms: 15,
    estimatedRent: 76500,
    rentMin: 70000,
    rentMax: 83000,
    rentPerSqm: 170,
    type: 'office',
    culture: 'modern',
    priceLevel: 'budget',
    verified: true,
    newlyRenovated: true,
    flexibleContract: false,
    amenities: ['Pentry', 'Dusch', 'Fiber', 'Parkering', 'Gym', 'Reception', 'Smart belysning', 'Larm'],
    images: ['/images/office3.jpg'],
    description: 'Rymligt kontor i Kista Science City. Utmärkt för techbolag som vill ha stora ytor till förmånligt pris. Nära till T-bana och motorväg.',
    lat: 59.4048,
    lng: 17.9443,
    metroDistance: 3,
    restaurantRating: 3,
    greenSpaceRating: 4,
    buildingYear: 2005,
    owner: 'Klövern',
    nearbyCompanies: ['Ericsson', 'Microsoft', 'IBM'],
    areaRentAverage: 180,
    rentVsAverage: -6
  },
  {
    id: '4',
    address: 'Strandvägen 7A',
    area: 'Östermalm',
    city: 'Stockholm',
    sqm: 180,
    rooms: 6,
    estimatedRent: 63000,
    rentMin: 58000,
    rentMax: 68000,
    rentPerSqm: 350,
    type: 'office',
    culture: 'traditional',
    priceLevel: 'premium',
    verified: true,
    newlyRenovated: false,
    flexibleContract: false,
    amenities: ['Pentry', 'Fiber', 'Reception', 'Parkering'],
    images: ['/images/office4.jpg'],
    description: 'Prestigefullt kontor på Strandvägen med utsikt över Nybroviken. Klassisk arkitektur med modern infrastruktur. Perfekt för advokatbyråer och finansbolag.',
    lat: 59.3315,
    lng: 18.0840,
    metroDistance: 8,
    restaurantRating: 4,
    greenSpaceRating: 5,
    buildingYear: 1890,
    owner: 'Humlegården Fastigheter',
    nearbyCompanies: ['Advokatfirma A', 'Fondbolag B', 'Konsultbolag C'],
    areaRentAverage: 340,
    rentVsAverage: 3
  },
  {
    id: '5',
    address: 'Kungsbron 1',
    area: 'Kungsholmen',
    city: 'Stockholm',
    sqm: 85,
    rooms: 3,
    estimatedRent: 18700,
    rentMin: 17000,
    rentMax: 21000,
    rentPerSqm: 220,
    type: 'office',
    culture: 'flexible',
    priceLevel: 'standard',
    verified: true,
    newlyRenovated: true,
    flexibleContract: true,
    amenities: ['Pentry', 'Fiber', 'Dusch', 'Cykelparkering'],
    images: ['/images/office5.jpg'],
    description: 'Kompakt men smart planerat kontor precis vid Centralen. Perfekt för små team som prioriterar tillgänglighet.',
    lat: 59.3325,
    lng: 18.0540,
    metroDistance: 1,
    restaurantRating: 4,
    greenSpaceRating: 2,
    buildingYear: 1980,
    owner: 'Jernhusen',
    nearbyCompanies: ['Startup Hub', 'Konsultbolag D', 'IT-företag E'],
    areaRentAverage: 235,
    rentVsAverage: -6
  },
  {
    id: '6',
    address: 'Slakthusplan 3',
    area: 'Johanneshov',
    city: 'Stockholm',
    sqm: 320,
    rooms: 10,
    estimatedRent: 57600,
    rentMin: 52000,
    rentMax: 63000,
    rentPerSqm: 180,
    type: 'office',
    culture: 'industrial',
    priceLevel: 'budget',
    verified: false,
    newlyRenovated: true,
    flexibleContract: true,
    amenities: ['Pentry', 'Dusch', 'Fiber', 'Parkering', 'Cykelparkering', 'Högt i tak'],
    images: ['/images/office6.jpg'],
    description: 'Industriellt kontor i trendiga Slakthusområdet. Öppet landskap med högt i tak. Perfekt för kreativa företag och agenturer.',
    lat: 59.3015,
    lng: 18.0768,
    metroDistance: 5,
    restaurantRating: 4,
    greenSpaceRating: 3,
    buildingYear: 1912,
    owner: 'Atrium Ljungberg',
    nearbyCompanies: ['Produktionsbolag X', 'Spelstudio Y', 'Arkitektkontor Z'],
    areaRentAverage: 195,
    rentVsAverage: -8
  },
  {
    id: '7',
    address: 'Östra Hamngatan 16',
    area: 'Centrum',
    city: 'Göteborg',
    sqm: 200,
    rooms: 7,
    estimatedRent: 40000,
    rentMin: 36000,
    rentMax: 44000,
    rentPerSqm: 200,
    type: 'office',
    culture: 'modern',
    priceLevel: 'standard',
    verified: true,
    newlyRenovated: false,
    flexibleContract: true,
    amenities: ['Pentry', 'Fiber', 'Reception', 'Gym'],
    images: ['/images/office7.jpg'],
    description: 'Centralt beläget kontor i Göteborgs hjärta. Gångavstånd till allt - kollektivtrafik, restauranger och shopping.',
    lat: 57.7055,
    lng: 11.9669,
    metroDistance: 3,
    restaurantRating: 5,
    greenSpaceRating: 2,
    buildingYear: 1975,
    owner: 'Castellum',
    nearbyCompanies: ['E-handelsbolag A', 'Fintech B', 'Mediebolag C'],
    areaRentAverage: 210,
    rentVsAverage: -5
  },
  {
    id: '8',
    address: 'Malmöhusvägen 1',
    area: 'Centrum',
    city: 'Malmö',
    sqm: 150,
    rooms: 5,
    estimatedRent: 24000,
    rentMin: 21000,
    rentMax: 27000,
    rentPerSqm: 160,
    type: 'office',
    culture: 'modern',
    priceLevel: 'budget',
    verified: true,
    newlyRenovated: true,
    flexibleContract: true,
    amenities: ['Pentry', 'Fiber', 'Cykelparkering', 'Dusch'],
    images: ['/images/office8.jpg'],
    description: 'Modernt kontor nära Malmö C med utmärkt kommunikation till Köpenhamn. Perfekt för företag i Öresundsregionen.',
    lat: 55.6086,
    lng: 12.9998,
    metroDistance: 5,
    restaurantRating: 4,
    greenSpaceRating: 4,
    buildingYear: 2010,
    owner: 'Wihlborgs',
    nearbyCompanies: ['Gaming Studio X', 'Cleantech Y', 'Life Science Z'],
    areaRentAverage: 175,
    rentVsAverage: -9
  }
];

export const areaStats: AreaStats[] = [
  { name: 'Norrmalm', city: 'Stockholm', avgRentPerSqm: 275, yearChange: 4.2, trend: 'up', totalListings: 156, lat: 59.3345, lng: 18.0632 },
  { name: 'Södermalm', city: 'Stockholm', avgRentPerSqm: 295, yearChange: 3.1, trend: 'up', totalListings: 89, lat: 59.3150, lng: 18.0731 },
  { name: 'Östermalm', city: 'Stockholm', avgRentPerSqm: 340, yearChange: 2.8, trend: 'up', totalListings: 67, lat: 59.3386, lng: 18.0890 },
  { name: 'Kungsholmen', city: 'Stockholm', avgRentPerSqm: 235, yearChange: 1.5, trend: 'stable', totalListings: 112, lat: 59.3328, lng: 18.0289 },
  { name: 'Kista', city: 'Stockholm', avgRentPerSqm: 180, yearChange: -0.8, trend: 'down', totalListings: 203, lat: 59.4050, lng: 17.9500 },
  { name: 'Johanneshov', city: 'Stockholm', avgRentPerSqm: 195, yearChange: 5.2, trend: 'up', totalListings: 45, lat: 59.2980, lng: 18.0750 },
  { name: 'Centrum', city: 'Göteborg', avgRentPerSqm: 210, yearChange: 2.1, trend: 'up', totalListings: 134, lat: 57.7055, lng: 11.9669 },
  { name: 'Centrum', city: 'Malmö', avgRentPerSqm: 175, yearChange: 1.8, trend: 'up', totalListings: 98, lat: 55.6050, lng: 13.0038 },
];

export const rentHistory: { [area: string]: RentHistoryPoint[] } = {
  'Norrmalm': [
    { month: 'Jan 2024', rent: 260 },
    { month: 'Feb 2024', rent: 262 },
    { month: 'Mar 2024', rent: 265 },
    { month: 'Apr 2024', rent: 268 },
    { month: 'Maj 2024', rent: 270 },
    { month: 'Jun 2024', rent: 272 },
    { month: 'Jul 2024', rent: 273 },
    { month: 'Aug 2024', rent: 274 },
    { month: 'Sep 2024', rent: 275 },
    { month: 'Okt 2024', rent: 276 },
    { month: 'Nov 2024', rent: 278 },
    { month: 'Dec 2024', rent: 275 },
  ],
  'Södermalm': [
    { month: 'Jan 2024', rent: 280 },
    { month: 'Feb 2024', rent: 282 },
    { month: 'Mar 2024', rent: 284 },
    { month: 'Apr 2024', rent: 286 },
    { month: 'Maj 2024', rent: 288 },
    { month: 'Jun 2024', rent: 290 },
    { month: 'Jul 2024', rent: 291 },
    { month: 'Aug 2024', rent: 292 },
    { month: 'Sep 2024', rent: 293 },
    { month: 'Okt 2024', rent: 294 },
    { month: 'Nov 2024', rent: 295 },
    { month: 'Dec 2024', rent: 295 },
  ],
  'Kista': [
    { month: 'Jan 2024', rent: 185 },
    { month: 'Feb 2024', rent: 184 },
    { month: 'Mar 2024', rent: 183 },
    { month: 'Apr 2024', rent: 182 },
    { month: 'Maj 2024', rent: 182 },
    { month: 'Jun 2024', rent: 181 },
    { month: 'Jul 2024', rent: 180 },
    { month: 'Aug 2024', rent: 180 },
    { month: 'Sep 2024', rent: 179 },
    { month: 'Okt 2024', rent: 180 },
    { month: 'Nov 2024', rent: 180 },
    { month: 'Dec 2024', rent: 180 },
  ],
};

export const commuteData = [
  { from: 'Södermalm', toNorrmalm: 12, toKista: 28, toKungsholmen: 15 },
  { from: 'Bromma', toNorrmalm: 18, toKista: 22, toKungsholmen: 12 },
  { from: 'Nacka', toNorrmalm: 22, toKista: 35, toKungsholmen: 28 },
  { from: 'Solna', toNorrmalm: 15, toKista: 12, toKungsholmen: 18 },
  { from: 'Sundbyberg', toNorrmalm: 14, toKista: 10, toKungsholmen: 16 },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('sv-SE').format(num);
};
