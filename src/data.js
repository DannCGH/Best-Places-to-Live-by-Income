export const NEIGHBORHOODS = [
  { id:'wynwood',        name:'Wynwood',                lat:25.8008, lng:-80.1994, medianRent:2950, medianIncome:58000,  studio:2100, oneBed:2950, twoBed:4100, population:18200, walkScore:88, transitScore:62, bikeScore:74, trend:[2400,2550,2680,2800,2900,2950] },
  { id:'brickell',       name:'Brickell',               lat:25.7617, lng:-80.1918, medianRent:3800, medianIncome:95000,  studio:2600, oneBed:3800, twoBed:5500, population:31500, walkScore:92, transitScore:78, bikeScore:68, trend:[3100,3300,3480,3600,3720,3800] },
  { id:'little_havana',  name:'Little Havana',          lat:25.7686, lng:-80.2214, medianRent:1650, medianIncome:38000,  studio:1100, oneBed:1650, twoBed:2200, population:55000, walkScore:76, transitScore:58, bikeScore:55, trend:[1300,1380,1480,1560,1600,1650] },
  { id:'downtown',       name:'Downtown Miami',                lat:25.7742, lng:-80.1937, medianRent:2750, medianIncome:62000,  studio:1950, oneBed:2750, twoBed:3800, population:42000, walkScore:96, transitScore:90, bikeScore:70, trend:[2200,2350,2480,2580,2680,2750] },
  { id:'coconut_grove',  name:'Coconut Grove',          lat:25.7319, lng:-80.2386, medianRent:2900, medianIncome:88000,  studio:2000, oneBed:2900, twoBed:4200, population:22000, walkScore:72, transitScore:42, bikeScore:60, trend:[2400,2520,2660,2760,2850,2900] },
  { id:'edgewater',      name:'Edgewater',              lat:25.7894, lng:-80.1869, medianRent:2650, medianIncome:67000,  studio:1850, oneBed:2650, twoBed:3600, population:19000, walkScore:85, transitScore:64, bikeScore:72, trend:[2100,2220,2380,2500,2580,2650] },
  { id:'overtown',       name:'Overtown',               lat:25.7880, lng:-80.2010, medianRent:1450, medianIncome:28000,  studio:950,  oneBed:1450, twoBed:1900, population:10500, walkScore:74, transitScore:70, bikeScore:58, trend:[1100,1180,1260,1350,1400,1450] },
  { id:'allapattah',     name:'Allapattah',             lat:25.8085, lng:-80.2250, medianRent:1700, medianIncome:40000,  studio:1150, oneBed:1700, twoBed:2200, population:37000, walkScore:78, transitScore:66, bikeScore:60, trend:[1300,1400,1500,1580,1640,1700] },
  { id:'midtown',        name:'Midtown Miami',                 lat:25.8089, lng:-80.1941, medianRent:2800, medianIncome:72000,  studio:1950, oneBed:2800, twoBed:3900, population:12000, walkScore:87, transitScore:60, bikeScore:68, trend:[2300,2440,2580,2680,2750,2800] },
  { id:'little_haiti',   name:'Little Haiti',           lat:25.8283, lng:-80.1980, medianRent:1550, medianIncome:32000,  studio:1000, oneBed:1550, twoBed:2050, population:30000, walkScore:70, transitScore:58, bikeScore:52, trend:[1100,1200,1320,1420,1490,1550] },
  { id:'west_flagler',   name:'West Flagler',           lat:25.7730, lng:-80.2380, medianRent:1800, medianIncome:45000,  studio:1200, oneBed:1800, twoBed:2400, population:27000, walkScore:72, transitScore:55, bikeScore:50, trend:[1400,1520,1620,1700,1760,1800] },
  { id:'design_district',name:'Design District',        lat:25.8128, lng:-80.1961, medianRent:3200, medianIncome:75000,  studio:2200, oneBed:3200, twoBed:4600, population:5000,  walkScore:82, transitScore:58, bikeScore:66, trend:[2700,2850,2980,3080,3150,3200] },
  { id:'key_biscayne',   name:'Key Biscayne',         lat:25.6908, lng:-80.1628, medianRent:4200, medianIncome:115000, studio:2800, oneBed:4200, twoBed:6000, population:12700, walkScore:55, transitScore:30, bikeScore:78, trend:[3600,3780,3920,4050,4130,4200] },
  { id:'kendall',        name:'Kendall',    lat:25.6827, lng:-80.3563, medianRent:2100, medianIncome:68000,  studio:1400, oneBed:2100, twoBed:2700, population:77000, walkScore:42, transitScore:34, bikeScore:38, trend:[1700,1820,1930,2010,2060,2100] },
];

// Lifestyle score bonuses
export const SCHOOL_BONUS = { coral_gables:15, miami_shores:10, coconut_grove:8, south_beach:3 };
export const WFH_BONUS    = { miami_shores:8,  coral_gables:6,  coconut_grove:6, west_flagler:4 };
