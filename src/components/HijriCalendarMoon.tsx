import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { 
  gregorianToHijri, 
  hijriToGregorian, 
  calculateMoonPhase, 
  getIslamicOccasions,
  HIJRI_MONTHS_AR,
  HIJRI_MONTHS_EN
} from '../utils/calendarEngine';
import { 
  Moon, 
  Calendar, 
  ArrowLeftRight, 
  Sparkles, 
  Clock, 
  CheckCircle,
  ChevronDown
} from 'lucide-react';

interface Props {
  language: Language;
}

const cleanNumberInput = (val: string, maxDigits = 4, maxVal?: number): string => {
  if (!val) return '';
  const cleaned = val.replace(/^0+(?=\d)/, '').slice(0, maxDigits);
  if (maxVal !== undefined && maxVal >= 0 && cleaned !== '' && Number(cleaned) > maxVal) {
    return String(maxVal);
  }
  return cleaned;
};

export const HijriCalendarMoon: React.FC<Props> = ({ language }) => {
  const t = translations[language];

  // Gregorian to Hijri input
  const [gregDateInput, setGregDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Hijri to Gregorian input
  const [hYearInput, setHYearInput] = useState<number | string>(1448);
  const [hMonthInput, setHMonthInput] = useState<number>(9); // Ramadan default
  const [hDayInput, setHDayInput] = useState<number | string>(1);

  const convertedHijri = useMemo(() => {
    const d = new Date(gregDateInput);
    return gregorianToHijri(d);
  }, [gregDateInput]);

  const convertedGreg = useMemo(() => {
    return hijriToGregorian(Number(hYearInput) || 1448, hMonthInput, Number(hDayInput) || 1);
  }, [hYearInput, hMonthInput, hDayInput]);

  // Current Moon Phase
  const moonInfo = useMemo(() => {
    return calculateMoonPhase(new Date());
  }, []);

  // Upcoming occasions
  const occasions = useMemo(() => {
    return getIslamicOccasions(convertedHijri.year);
  }, [convertedHijri.year]);

  return (
    <div className="space-y-8">
      {/* Title Card */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'الشهور القمرية والأهلة' : 'Lunar Calendar & Moon Phases'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.calendar.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {t.calendar.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Moon Phase & Converter (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Moon Phase Visualizer Card */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 text-center backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-xl text-[#f3e5ab] flex items-center justify-center gap-2">
              <Moon className="w-5 h-5 text-[#c8a951]" />
              <span>{t.calendar.moonPhase}</span>
            </h3>

            {/* Glowing SVG Moon Graphic */}
            <div className="flex justify-center py-4">
              <div className="moon-phase-sky relative w-44 h-44 rounded-full bg-gradient-to-br from-slate-900 to-black border-2 border-[#c8a951]/40 shadow-[0_0_35px_rgba(200,169,81,0.2)] flex items-center justify-center overflow-hidden">
                {/* Moon crater textures */}
                <div className="absolute w-6 h-6 rounded-full bg-slate-800/40 top-8 left-10" />
                <div className="absolute w-10 h-10 rounded-full bg-slate-800/30 bottom-8 right-8" />
                <div className="absolute w-4 h-4 rounded-full bg-slate-800/40 top-16 right-12" />

                {/* Illuminated portion simulated by SVG */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff8e7" />
                      <stop offset="70%" stopColor="#f3e5ab" />
                      <stop offset="100%" stopColor="#c8a951" />
                    </radialGradient>
                  </defs>
                  {/* Moon illumination shape based on phase */}
                  <circle cx="50" cy="50" r="46" fill="url(#moonGlow)" opacity={moonInfo.illuminationPct / 100} />
                </svg>

                <div className="absolute bottom-3 px-2 py-0.5 rounded-full bg-black/60 text-[#f3e5ab] text-[10px] font-mono border border-[#c8a951]/30">
                  {moonInfo.illuminationPct}% {language === 'ar' ? 'إضاءة' : 'illumination'}
                </div>
              </div>
            </div>

            {/* Moon details */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#c8a951]/20">
              <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/15">
                <span className="text-slate-400 block mb-1">{language === 'ar' ? 'اسم الطور' : 'Phase'}</span>
                <span className="font-amiri font-bold text-base text-[#f3e5ab]">
                  {language === 'ar' ? moonInfo.phaseNameAr : moonInfo.phaseNameEn}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/15">
                <span className="text-slate-400 block mb-1">{t.calendar.moonAge}</span>
                <span className="font-mono text-base font-bold text-[#f3e5ab]">
                  {moonInfo.ageDays} {language === 'ar' ? 'يوم' : 'days'}
                </span>
              </div>
            </div>
          </div>

          {/* Bidirectional Converter */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-xl text-[#f3e5ab] flex items-center gap-2 border-b border-[#c8a951]/20 pb-3">
              <ArrowLeftRight className="w-5 h-5 text-[#c8a951]" />
              <span>{t.calendar.converter}</span>
            </h3>

            {/* Gregorian to Hijri */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#e6cb7a]">
                {t.calendar.gregorianToHijri}
              </label>
              <input
                type="date"
                value={gregDateInput}
                onChange={(e) => setGregDateInput(e.target.value)}
                className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
              />
              <div className="p-3 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.calendar.todayIs}:</span>
                <span className="font-amiri font-bold text-base text-[#f3e5ab]">
                  {convertedHijri.formattedAr}
                </span>
              </div>
            </div>

            {/* Hijri to Gregorian */}
            <div className="space-y-2 pt-3 border-t border-[#c8a951]/20">
              <label className="block text-xs font-semibold text-[#e6cb7a]">
                {t.calendar.hijriToGregorian}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={hDayInput === 0 || hDayInput === '0' || hDayInput === '' ? '' : hDayInput}
                  onChange={(e) => setHDayInput(cleanNumberInput(e.target.value, 2, 30))}
                  className="bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-2 py-1.5 text-center text-white font-bold text-xs"
                  placeholder="1"
                />
                <div className="relative flex items-center">
                  <select
                    value={hMonthInput}
                    onChange={(e) => setHMonthInput(Number(e.target.value))}
                    className="w-full appearance-none bg-[#07261d] border border-[#c8a951]/30 rounded-xl ps-2 pe-7 py-1.5 text-white font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
                  >
                    {(language === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN).map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#c8a951] absolute end-2 pointer-events-none" />
                </div>
                <input
                  type="number"
                  min="1300"
                  max="1600"
                  value={hYearInput === 0 || hYearInput === '0' || hYearInput === '' ? '' : hYearInput}
                  onChange={(e) => setHYearInput(cleanNumberInput(e.target.value, 4, 1600))}
                  className="bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-2 py-1.5 text-center text-white font-bold text-xs"
                  placeholder="1448"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'ar' ? 'الموافق ميلادياً:' : 'Gregorian Equivalent:'}</span>
                <span className="font-bold text-white">
                  {convertedGreg.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Occasions Countdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-xl text-[#f3e5ab] flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c8a951]" />
                <span>{t.calendar.upcomingEvents}</span>
              </span>
              <span className="text-xs text-[#e6cb7a] font-normal">عام {convertedHijri.year} هـ</span>
            </h3>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pe-1">
              {occasions.map((occ) => (
                <div
                  key={occ.id}
                  className="p-3.5 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 hover:border-[#c8a951]/50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-amiri font-bold text-base text-white">
                      {language === 'ar' ? occ.titleAr : occ.titleEn}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-[#0b3d2e] border border-[#c8a951]/40 text-[#f3e5ab] text-xs font-bold font-mono">
                      {occ.daysRemaining === 0
                        ? language === 'ar' ? 'اليوم!' : 'Today!'
                        : `${occ.daysRemaining} ${t.calendar.daysLeft}`}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-amiri leading-relaxed">
                    {language === 'ar' ? occ.descriptionAr : occ.descriptionEn}
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3 text-[#c8a951]" />
                    <span>{language === 'ar' ? 'الموافق تقريباً:' : 'Estimated:'} {occ.gregorianEstimate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
