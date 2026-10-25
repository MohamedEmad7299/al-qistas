import { HijriDateInfo, MoonPhaseInfo, IslamicOccasion } from '../types';

export const HIJRI_MONTHS_AR = [
  'المحرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'
];

export const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

export const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Convert Gregorian Date to Hijri Date
export function gregorianToHijri(date: Date, adjustmentDays = 0): HijriDateInfo {
  const d = new Date(date);
  d.setDate(d.getDate() + adjustmentDays);

  let day = d.getDate();
  let month = d.getMonth();
  let year = d.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Approximate Hijri conversion from Julian Day
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const validMonth = Math.min(12, Math.max(1, hijriMonth));
  const validDay = Math.min(30, Math.max(1, hijriDay));

  const dayOfWeekIdx = d.getDay();

  return {
    day: validDay,
    month: validMonth,
    year: hijriYear,
    monthNameAr: HIJRI_MONTHS_AR[validMonth - 1],
    monthNameEn: HIJRI_MONTHS_EN[validMonth - 1],
    gregorianDate: date,
    formattedAr: `${validDay} ${HIJRI_MONTHS_AR[validMonth - 1]} ${hijriYear} هـ`,
    formattedEn: `${validDay} ${HIJRI_MONTHS_EN[validMonth - 1]} ${hijriYear} AH`,
    dayOfWeekAr: DAYS_AR[dayOfWeekIdx],
    dayOfWeekEn: DAYS_EN[dayOfWeekIdx]
  };
}

// Convert Hijri to Approximate Gregorian Date
export function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  // Julian Day from Hijri date
  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;

  // Convert Julian Day to Gregorian
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const b = z + 1 + a - Math.floor(a / 4);
  const c = b + 1524;
  const d = Math.floor((c - 122.1) / 365.25);
  const e = Math.floor(365.25 * d);
  const g = Math.floor((c - e) / 30.6001);

  const day = c - e - Math.floor(30.6001 * g);
  let month = g < 14 ? g - 1 : g - 13;
  let year = month > 2 ? d - 4716 : d - 4715;

  return new Date(year, month - 1, day);
}

// Calculate Moon Phase & Illumination
export function calculateMoonPhase(date: Date): MoonPhaseInfo {
  // Known new moon reference: Jan 6, 2000, 18:14 UTC (JD 2451549.26)
  const d = date.getTime();
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;

  const diffMs = d - knownNewMoon;
  const cycles = diffMs / synodicMonthMs;
  const phase = cycles - Math.floor(cycles); // 0 to 1

  const ageDays = Math.round(phase * 29.53058867 * 10) / 10;
  // Illumination percentage
  const illuminationPct = Math.round(((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100);

  let phaseNameAr = 'محاق (هلال جديد)';
  let phaseNameEn = 'New Moon';

  if (phase < 0.03 || phase > 0.97) {
    phaseNameAr = 'محاق (ولادة الهلال)';
    phaseNameEn = 'New Moon';
  } else if (phase < 0.22) {
    phaseNameAr = 'هلال متزايد (بداية الشهر)';
    phaseNameEn = 'Waxing Crescent';
  } else if (phase < 0.28) {
    phaseNameAr = 'تربيع أول';
    phaseNameEn = 'First Quarter';
  } else if (phase < 0.47) {
    phaseNameAr = 'أحدب متزايد';
    phaseNameEn = 'Waxing Gibbous';
  } else if (phase < 0.53) {
    phaseNameAr = 'بدر مكتمل (ليالي البيض)';
    phaseNameEn = 'Full Moon';
  } else if (phase < 0.72) {
    phaseNameAr = 'أحدب متناقص';
    phaseNameEn = 'Waning Gibbous';
  } else if (phase < 0.78) {
    phaseNameAr = 'تربيع ثانٍ (أخير)';
    phaseNameEn = 'Third Quarter';
  } else {
    phaseNameAr = 'هلال متناقص (نهاية الشهر)';
    phaseNameEn = 'Waning Crescent';
  }

  return {
    phase,
    illuminationPct,
    ageDays,
    phaseNameAr,
    phaseNameEn
  };
}

// Calculate countdown to major Islamic occasions
export function getIslamicOccasions(currentHijriYear: number): IslamicOccasion[] {
  const occasionsBase = [
    {
      id: 'hijri_new_year',
      titleAr: 'رأس السنة الهجرية (1 محرم)',
      titleEn: 'Islamic New Year (1st Muharram)',
      hijriDay: 1,
      hijriMonth: 1,
      descAr: 'ذكرى الهجرة النبوية المباركة وبداية العام الهجري الجديد',
      descEn: 'Commemoration of the Prophet\'s migration to Madinah'
    },
    {
      id: 'ashura',
      titleAr: 'يوم عاشوراء (10 محرم)',
      titleEn: 'Day of Ashura (10th Muharram)',
      hijriDay: 10,
      hijriMonth: 1,
      descAr: 'اليوم الذي نجى الله فيه موسى وقومه، ويُستحب صيامه',
      descEn: 'The day Moses was saved; fasting is highly recommended'
    },
    {
      id: 'mawlid',
      titleAr: 'المولد النبوي الشريف (12 ربيع الأول)',
      titleEn: 'Prophet\'s Birthday (Mawlid - 12th Rabi I)',
      hijriDay: 12,
      hijriMonth: 3,
      descAr: 'مولد خير البرية وخاتم النبيين محمد ﷺ',
      descEn: 'Birthday of Prophet Muhammad ﷺ'
    },
    {
      id: 'isra_miraj',
      titleAr: 'ذكرى الإسراء والمعراج (27 رجب)',
      titleEn: 'Isra & Mi\'raj (27th Rajab)',
      hijriDay: 27,
      hijriMonth: 7,
      descAr: 'رحلة الإسراء من المسجد الحرام للمسجد الأقصى والعروج للسماوات',
      descEn: 'The Night Journey from Makkah to Jerusalem and Ascension'
    },
    {
      id: 'mid_shaban',
      titleAr: 'ليلة النصف من شعبان (15 شعبان)',
      titleEn: 'Mid-Sha\'ban (15th Sha\'ban)',
      hijriDay: 15,
      hijriMonth: 8,
      descAr: 'ليلة مباركة تُرفع فيها الأعمال إلى الله تعالى',
      descEn: 'A virtuous night preceding Ramadan'
    },
    {
      id: 'ramadan_start',
      titleAr: 'غرة شهر رمضان المبارك (1 رمضان)',
      titleEn: 'First Day of Holy Ramadan (1st Ramadan)',
      hijriDay: 1,
      hijriMonth: 9,
      descAr: 'بداية شهر الصيام والقرآن والرحمة والمغفرة والعتق من النار',
      descEn: 'Commencement of the holy month of fasting'
    },
    {
      id: 'eid_fitr',
      titleAr: 'عيد الفطر المبارك (1 شوال)',
      titleEn: 'Eid al-Fitr (1st Shawwal)',
      hijriDay: 1,
      hijriMonth: 10,
      descAr: 'يوم الجائزة والفرح بإتمام صيام شهر رمضان',
      descEn: 'Celebration marking the conclusion of Ramadan fasting'
    },
    {
      id: 'arafah',
      titleAr: 'يوم عرفة (9 ذو الحجة)',
      titleEn: 'Day of Arafah (9th Dhu al-Hijjah)',
      hijriDay: 9,
      hijriMonth: 12,
      descAr: 'أعظم أيام السنة، ركن الحج الأكبر، ويُكفّر صيامه سنتين',
      descEn: 'The pinnacle of Hajj; fasting expiates sins of two years'
    },
    {
      id: 'eid_adha',
      titleAr: 'عيد الأضحى المبارك (10 ذو الحجة)',
      titleEn: 'Eid al-Adha (10th Dhu al-Hijjah)',
      hijriDay: 10,
      hijriMonth: 12,
      descAr: 'يوم النحر وأعظم أيام الحج وإحياء سنة الخليل إبراهيم عليه السلام',
      descEn: 'Feast of the Sacrifice commemorating Prophet Abraham'
    }
  ];

  const today = new Date();

  return occasionsBase.map(occ => {
    let targetGreg = hijriToGregorian(currentHijriYear, occ.hijriMonth, occ.hijriDay);
    // If the date has already passed this year, calculate for next year
    if (targetGreg.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
      targetGreg = hijriToGregorian(currentHijriYear + 1, occ.hijriMonth, occ.hijriDay);
    }

    const diffDays = Math.ceil((targetGreg.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: occ.id,
      titleAr: occ.titleAr,
      titleEn: occ.titleEn,
      hijriDay: occ.hijriDay,
      hijriMonth: occ.hijriMonth,
      gregorianEstimate: targetGreg.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysRemaining: Math.max(0, diffDays),
      descriptionAr: occ.descAr,
      descriptionEn: occ.descEn
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);
}
