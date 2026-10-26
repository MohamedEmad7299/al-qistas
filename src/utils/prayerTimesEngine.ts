import { PrayerTimeItem, QiblaInfo } from '../types';

export interface PrayerCalcParams {
  lat: number;
  lng: number;
  timezoneOffsetHours: number; // e.g. +3 for KSA/Egypt
  date: Date;
  method?: 'MWL' | 'Egypt' | 'UmmAlQura' | 'ISNA' | 'Karachi';
  asrJuristic?: 'standard' | 'hanafi';
}

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function fixAngle(angle: number): number {
  let a = angle - 360 * Math.floor(angle / 360);
  if (a < 0) a += 360;
  return a;
}

function fixHour(hour: number): number {
  let h = hour - 24 * Math.floor(hour / 24);
  if (h < 0) h += 24;
  return h;
}

export function computeSolarPosition(julianDay: number) {
  const d = julianDay - 2451545.0;
  const q = 280.459 + 0.98564736 * d;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const gRad = degToRad(g);
  
  const l = fixAngle(q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad));
  const lRad = degToRad(l);
  
  const e = 23.439 - 0.00000036 * d;
  const eRad = degToRad(e);
  
  const sinDelta = Math.sin(eRad) * Math.sin(lRad);
  const delta = radToDeg(Math.asin(sinDelta)); // declination
  
  const alphaRad = Math.atan2(Math.cos(eRad) * Math.sin(lRad), Math.cos(lRad));
  let alpha = fixAngle(radToDeg(alphaRad)) / 15; // right ascension in hours
  
  const eot = (fixAngle(q) / 15) - alpha; // Equation of time in hours
  return { declination: delta, equationOfTime: eot * 60 }; // eot in minutes
}

export function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

export function calculatePrayerTimes(params: PrayerCalcParams): {
  prayers: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem;
  fastingDurationMinutes: number;
} {
  const { lat, lng, timezoneOffsetHours, date, method = 'Egypt', asrJuristic = 'standard' } = params;
  const jd = getJulianDay(date);
  const solar = computeSolarPosition(jd);
  const decl = solar.declination;
  const eot = solar.equationOfTime;

  // Solar noon (Dhuhr) in fractional hours
  const dhuhrHours = 12 + timezoneOffsetHours - (lng / 15) - (eot / 60);

  // Hour angle helper
  const hourAngle = (angle: number): number | null => {
    const latRad = degToRad(lat);
    const declRad = degToRad(decl);
    const angleRad = degToRad(angle);

    const cosH = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declRad)) /
                 (Math.cos(latRad) * Math.cos(declRad));
    
    if (cosH > 1 || cosH < -1) return null; // Extreme latitudes
    return radToDeg(Math.acos(cosH)) / 15; // hours
  };

  // Asr calculation
  const asrFactor = asrJuristic === 'hanafi' ? 2 : 1;
  const latRad = degToRad(lat);
  const declRad = degToRad(decl);
  const asrAngleRad = Math.atan(1 / (asrFactor + Math.tan(Math.abs(latRad - declRad))));
  const asrAngle = radToDeg(asrAngleRad);
  const asrHA = hourAngle(asrAngle) || 3;

  // Sunrise / Sunset (angle = -0.833 for atmospheric refraction)
  const sunHA = hourAngle(-0.833) || 6;
  const sunriseHours = dhuhrHours - sunHA;
  const sunsetHours = dhuhrHours + sunHA;

  // Fajr and Isha angle parameters
  let fajrAngle = -18;
  let ishaAngle = -17;
  let ishaFixedMinutesAfterMaghrib: number | null = null;

  if (method === 'Egypt') {
    fajrAngle = -19.5;
    ishaAngle = -17.5;
  } else if (method === 'UmmAlQura') {
    fajrAngle = -18.5;
    ishaFixedMinutesAfterMaghrib = 90; // 90 min after Maghrib (120 min during Ramadan)
  } else if (method === 'ISNA') {
    fajrAngle = -15;
    ishaAngle = -15;
  } else if (method === 'Karachi') {
    fajrAngle = -18;
    ishaAngle = -18;
  }

  const fajrHA = hourAngle(fajrAngle) || 6.2;
  const fajrHours = dhuhrHours - fajrHA;
  const asrHours = dhuhrHours + asrHA;
  const maghribHours = sunsetHours;
  
  let ishaHours: number;
  if (ishaFixedMinutesAfterMaghrib !== null) {
    ishaHours = maghribHours + (ishaFixedMinutesAfterMaghrib / 60);
  } else {
    const ishaHA = hourAngle(ishaAngle) || 6.2;
    ishaHours = dhuhrHours + ishaHA;
  }

  // Convert fractional hours to Date objects
  const hoursToDate = (h: number): Date => {
    const d = new Date(date);
    const fixedH = fixHour(h);
    const hour = Math.floor(fixedH);
    const minutes = Math.floor((fixedH - hour) * 60);
    const seconds = Math.floor((((fixedH - hour) * 60) - minutes) * 60);
    d.setHours(hour, minutes, seconds, 0);
    return d;
  };

  const formatTime = (d: Date): string => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fajrDate = hoursToDate(fajrHours);
  const sunriseDate = hoursToDate(sunriseHours);
  const dhuhrDate = hoursToDate(dhuhrHours);
  const asrDate = hoursToDate(asrHours);
  const maghribDate = hoursToDate(maghribHours);
  const ishaDate = hoursToDate(ishaHours);

  const prayers: PrayerTimeItem[] = [
    { id: 'fajr', nameAr: 'الفجر', nameEn: 'Fajr', timeString: formatTime(fajrDate), timestamp: fajrDate },
    { id: 'sunrise', nameAr: 'الشروق', nameEn: 'Sunrise', timeString: formatTime(sunriseDate), timestamp: sunriseDate },
    { id: 'dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', timeString: formatTime(dhuhrDate), timestamp: dhuhrDate },
    { id: 'asr', nameAr: 'العصر', nameEn: 'Asr', timeString: formatTime(asrDate), timestamp: asrDate },
    { id: 'maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', timeString: formatTime(maghribDate), timestamp: maghribDate },
    { id: 'isha', nameAr: 'العشاء', nameEn: 'Isha', timeString: formatTime(ishaDate), timestamp: ishaDate },
  ];

  // Determine next prayer relative to current time
  const now = date || new Date();

  // Find next upcoming prayer today (excluding sunrise as an obligatory prayer for countdown)
  const candidatePrayers = prayers.filter(p => p.id !== 'sunrise');
  let nextPrayer = candidatePrayers.find(p => p.timestamp.getTime() > now.getTime());

  if (!nextPrayer) {
    // All prayers today have passed (after Isha).
    // The next prayer is tomorrow's Fajr!
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowJd = getJulianDay(tomorrow);
    const tomorrowSolar = computeSolarPosition(tomorrowJd);
    const tomorrowDhuhr = 12 + timezoneOffsetHours - (lng / 15) - (tomorrowSolar.equationOfTime / 60);

    const latRadT = degToRad(lat);
    const declRadT = degToRad(tomorrowSolar.declination);
    const angleRadT = degToRad(fajrAngle);
    const cosHT = (Math.sin(angleRadT) - Math.sin(latRadT) * Math.sin(declRadT)) /
                  (Math.cos(latRadT) * Math.cos(declRadT));
    const tomorrowFajrHA = (cosHT <= 1 && cosHT >= -1) ? (radToDeg(Math.acos(cosHT)) / 15) : 6.2;
    const tomorrowFajrHours = tomorrowDhuhr - tomorrowFajrHA;

    const tomorrowFajrDate = new Date(tomorrow);
    const fixedH = fixHour(tomorrowFajrHours);
    const hour = Math.floor(fixedH);
    const minutes = Math.floor((fixedH - hour) * 60);
    const seconds = Math.floor((((fixedH - hour) * 60) - minutes) * 60);
    tomorrowFajrDate.setHours(hour, minutes, seconds, 0);

    nextPrayer = {
      id: 'fajr',
      nameAr: 'الفجر',
      nameEn: 'Fajr',
      timeString: formatTime(tomorrowFajrDate),
      timestamp: tomorrowFajrDate,
      isNext: true,
    };
    prayers[0].isNext = true; // Highlight Fajr card in daily schedule
  } else {
    // Mark the matched prayer as next in prayers array
    const matched = prayers.find(p => p.id === nextPrayer!.id);
    if (matched) matched.isNext = true;
  }

  // Fasting duration = Maghrib - Fajr
  const fastingDurationMinutes = Math.round((maghribDate.getTime() - fajrDate.getTime()) / (1000 * 60));

  return {
    prayers,
    nextPrayer,
    fastingDurationMinutes
  };
}

export function calculateQibla(userLat: number, userLng: number): QiblaInfo {
  const phiK = degToRad(KAABA_LAT);
  const lambdaK = degToRad(KAABA_LNG);
  const phi = degToRad(userLat);
  const lambda = degToRad(userLng);

  const deltaLambda = lambdaK - lambda;
  
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  
  let qiblaBearing = radToDeg(Math.atan2(y, x));
  qiblaBearing = fixAngle(qiblaBearing);

  // Great circle distance (Haversine)
  const R = 6371; // Earth radius in km
  const deltaPhi = phiK - phi;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi) * Math.cos(phiK) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Cardinal direction label
  let cardinal = 'N';
  if (qiblaBearing >= 337.5 || qiblaBearing < 22.5) cardinal = 'N (شمال)';
  else if (qiblaBearing >= 22.5 && qiblaBearing < 67.5) cardinal = 'NE (شمال شرق)';
  else if (qiblaBearing >= 67.5 && qiblaBearing < 112.5) cardinal = 'E (شرق)';
  else if (qiblaBearing >= 112.5 && qiblaBearing < 157.5) cardinal = 'SE (جنوب شرق)';
  else if (qiblaBearing >= 157.5 && qiblaBearing < 202.5) cardinal = 'S (جنوب)';
  else if (qiblaBearing >= 202.5 && qiblaBearing < 247.5) cardinal = 'SW (جنوب غرب)';
  else if (qiblaBearing >= 247.5 && qiblaBearing < 292.5) cardinal = 'W (غرب)';
  else if (qiblaBearing >= 292.5 && qiblaBearing < 337.5) cardinal = 'NW (شمال غرب)';

  return {
    bearing: Math.round(qiblaBearing * 10) / 10,
    compassAngle: Math.round(qiblaBearing),
    distanceKm,
    directionCardinal: cardinal
  };
}

export const MAJOR_WORLD_CITIES = [
  { nameAr: 'القاهرة (مصر)', nameEn: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, tz: 3 },
  { nameAr: 'مكة المكرمة (السعودية)', nameEn: 'Makkah, Saudi Arabia', lat: 21.4225, lng: 39.8262, tz: 3 },
  { nameAr: 'المدينة المنورة (السعودية)', nameEn: 'Madinah, Saudi Arabia', lat: 24.5247, lng: 39.5692, tz: 3 },
  { nameAr: 'الرياض (السعودية)', nameEn: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753, tz: 3 },
  { nameAr: 'القدس الشريف (فلسطين)', nameEn: 'Jerusalem, Palestine', lat: 31.7683, lng: 35.2137, tz: 3 },
  { nameAr: 'دبي (الإمارات)', nameEn: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4 },
  { nameAr: 'إسطنبول (تركيا)', nameEn: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784, tz: 3 },
  { nameAr: 'كوالالمبور (ماليزيا)', nameEn: 'Kuala Lumpur, Malaysia', lat: 3.1390, lng: 101.6869, tz: 8 },
  { nameAr: 'جاكرتا (إندونيسيا)', nameEn: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456, tz: 7 },
  { nameAr: 'لندن (المملكة المتحدة)', nameEn: 'London, UK', lat: 51.5074, lng: -0.1278, tz: 0 },
  { nameAr: 'نيويورك (الولايات المتحدة)', nameEn: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -4 },
  { nameAr: 'باريس (فرنسا)', nameEn: 'Paris, France', lat: 48.8566, lng: 2.3522, tz: 2 },
  { nameAr: 'سيدني (أستراليا)', nameEn: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, tz: 10 },
];
