import React, { useState, useEffect, useMemo } from 'react';
import { Language, PrayerTimeItem, QiblaInfo } from '../types';
import { translations } from '../translations/translations';
import { 
  calculatePrayerTimes, 
  calculateQibla, 
  MAJOR_WORLD_CITIES, 
  PrayerCalcParams 
} from '../utils/prayerTimesEngine';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Calendar, 
  FileText,
  Navigation,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: { type: 'imsakiya'; prayers: PrayerTimeItem[]; city: string; qibla: QiblaInfo }) => void;
}

export const PrayerTimesAndQibla: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [selectedCityIndex, setSelectedCityIndex] = useState<number>(0);
  const [lat, setLat] = useState<number>(MAJOR_WORLD_CITIES[0].lat);
  const [lng, setLng] = useState<number>(MAJOR_WORLD_CITIES[0].lng);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(MAJOR_WORLD_CITIES[0].tz);
  const [cityName, setCityName] = useState<string>(MAJOR_WORLD_CITIES[0].nameAr);

  const [method, setMethod] = useState<'MWL' | 'Egypt' | 'UmmAlQura' | 'ISNA' | 'Karachi'>('Egypt');
  const [asrJuristic, setAsrJuristic] = useState<'standard' | 'hanafi'>('standard');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Device orientation for mobile compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
      }
    };
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const handleCityChange = (index: number) => {
    setSelectedCityIndex(index);
    const c = MAJOR_WORLD_CITIES[index];
    setLat(c.lat);
    setLng(c.lng);
    setTimezoneOffset(c.tz);
    setCityName(language === 'ar' ? c.nameAr : c.nameEn);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'ar' ? 'خاصية تحديد الموقع غير مدعومة في متصفحك' : 'Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        const tz = -new Date().getTimezoneOffset() / 60;
        setTimezoneOffset(tz);
        setCityName(language === 'ar' ? 'موقعي الحالي (GPS)' : 'Current Location (GPS)');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert(language === 'ar' ? 'تعذر الوصول للموقع. يرجى تفعيل إذن الموقع أو اختيار المدينة من القائمة.' : 'Unable to retrieve location. Please grant permission or select a city from the list.');
      }
    );
  };

  const calcParams: PrayerCalcParams = useMemo(() => {
    return {
      lat,
      lng,
      timezoneOffsetHours: timezoneOffset,
      date: currentTime,
      method,
      asrJuristic,
    };
  }, [lat, lng, timezoneOffset, currentTime, method, asrJuristic]);

  const { prayers, nextPrayer, fastingDurationMinutes } = useMemo(() => {
    return calculatePrayerTimes(calcParams);
  }, [calcParams]);

  const qibla = useMemo(() => {
    return calculateQibla(lat, lng);
  }, [lat, lng]);

  // Countdown to next prayer in HH:MM:SS
  const countdownString = useMemo(() => {
    if (!nextPrayer) return '--:--:--';
    const diffMs = nextPrayer.timestamp.getTime() - currentTime.getTime();
    if (diffMs <= 0) return '00:00:00';

    const h = Math.floor(diffMs / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [nextPrayer, currentTime]);

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case 'fajr': return Sunset;
      case 'sunrise': return Sunrise;
      case 'dhuhr': return Sun;
      case 'asr': return Sun;
      case 'maghrib': return Sunset;
      case 'isha': return Moon;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Location Header */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'الصلاة عماد الدين' : 'Second Pillar of Islam'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.prayers.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {t.prayers.subtitle}
            </p>
          </div>

          {/* Quick city or GPS buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/40 text-[#f3e5ab] text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#c8a951]" />
              <span>{t.prayers.locateMe}</span>
            </button>

            <div className="relative inline-flex items-center">
              <select
                value={selectedCityIndex}
                onChange={(e) => handleCityChange(Number(e.target.value))}
                className="appearance-none bg-[#07261d] border border-[#c8a951]/40 text-[#f3e5ab] text-xs font-bold rounded-xl ps-3.5 pe-9 py-2 focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
              >
                {MAJOR_WORLD_CITIES.map((c, i) => (
                  <option key={i} value={i}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#c8a951] absolute end-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Countdown + Daily Schedule (7 cols) and Qibla Compass (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Countdowns & Times (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Next Prayer Live Countdown Hero */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b3d2e] via-[#07261d] to-[#041410] border-2 border-[#c8a951]/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#e6cb7a] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#c8a951]" />
                  <span>{t.prayers.nextPrayerIn}</span>
                  <span className="text-[#f3e5ab] font-amiri text-sm font-bold">
                    ({language === 'ar' ? nextPrayer.nameAr : nextPrayer.nameEn})
                  </span>
                </span>

                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
                  {countdownString}
                </div>

                <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                  <span>{cityName}</span>
                  <span>•</span>
                  <span>{language === 'ar' ? 'الوقت المقرر:' : 'Scheduled at:'} {nextPrayer.timeString}</span>
                </div>
              </div>

              {/* Fasting Duration Badge */}
              <div className="p-4 rounded-xl bg-[#051a14]/80 border border-[#c8a951]/20 text-center sm:text-right min-w-[140px]">
                <span className="text-[11px] text-[#e6cb7a] block">{t.prayers.fastingDuration}</span>
                <span className="font-amiri text-2xl font-bold text-[#f3e5ab] mt-0.5 block">
                  {Math.floor(fastingDurationMinutes / 60)} {language === 'ar' ? 'س' : 'h'}{' '}
                  {fastingDurationMinutes % 60} {language === 'ar' ? 'د' : 'm'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">من الفجر للمغرب</span>
              </div>
            </div>
          </div>

          {/* Today's 6 Prayer Times Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {prayers.map((prayer) => {
              const Icon = getPrayerIcon(prayer.id);
              const isNext = prayer.id === nextPrayer.id;
              return (
                <div
                  key={prayer.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isNext
                      ? 'bg-gradient-to-br from-[#0e4d3a] to-[#07261d] border-[#c8a951] shadow-lg scale-[1.02]'
                      : 'bg-[#0b3d2e]/70 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-300 mb-2">
                    <span className="font-amiri font-bold text-base text-white">
                      {language === 'ar' ? prayer.nameAr : prayer.nameEn}
                    </span>
                    <Icon className={`w-4 h-4 ${isNext ? 'text-[#c8a951]' : 'text-slate-400'}`} />
                  </div>

                  <div className="font-mono text-xl font-bold text-[#f3e5ab]">
                    {prayer.timeString}
                  </div>

                  {isNext && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#c8a951] text-[#07261d] text-[10px] font-bold">
                      {language === 'ar' ? 'الصلاة القادمة' : 'Next Prayer'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calculation Settings Accordion */}
          <div className="bg-[#0b3d2e]/60 border border-[#c8a951]/20 rounded-2xl p-4 text-xs space-y-3">
            <span className="font-bold text-[#e6cb7a] block">{language === 'ar' ? 'إعدادات الحساب الفلكي' : 'Calculation Parameters'}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">{t.prayers.calcMethod}</label>
                <div className="relative flex items-center">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full appearance-none bg-[#07261d] border border-[#c8a951]/30 rounded-xl ps-3.5 pe-9 py-2 text-white font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
                  >
                    <option value="UmmAlQura">جامعة أم القرى (مكة المكرمة)</option>
                    <option value="Egypt">الهيئة المصرية العامة للمساحة</option>
                    <option value="MWL">رابطة العالم الإسلامي (MWL)</option>
                    <option value="ISNA">الجمعية الإسلامية بأمريكا الشمالية (ISNA)</option>
                    <option value="Karachi">جامعة العلوم الإسلامية بكراتشي</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#c8a951] absolute end-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">{t.prayers.asrMethod}</label>
                <div className="relative flex items-center">
                  <select
                    value={asrJuristic}
                    onChange={(e) => setAsrJuristic(e.target.value as any)}
                    className="w-full appearance-none bg-[#07261d] border border-[#c8a951]/30 rounded-xl ps-3.5 pe-9 py-2 text-white font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
                  >
                    <option value="standard">{t.prayers.shafiMethod}</option>
                    <option value="hanafi">{t.prayers.hanafiMethod}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#c8a951] absolute end-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Qibla Compass (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 text-center relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <span className="font-amiri font-bold text-lg text-[#f3e5ab] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#c8a951]" />
                <span>{language === 'ar' ? 'بوصلة اتجاه القبلة' : 'Interactive Qibla Compass'}</span>
              </span>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'imsakiya', prayers, city: cityName, qibla })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'ar' ? 'تصدير الإمساكية PDF' : 'Export Imsakiya PDF'}</span>
              </button>
            </div>

            {/* Compass Visualization */}
            <div className="flex justify-center py-4">
              <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-[#07261d] via-[#051a14] to-[#041410] border-4 border-[#c8a951] shadow-[0_0_25px_rgba(200,169,81,0.25)] flex items-center justify-center">
                {/* Degree markings on dial */}
                <div
                  className="absolute inset-0 rounded-full transition-transform duration-500 ease-out"
                  style={{ transform: `rotate(${deviceHeading ? -deviceHeading : 0}deg)` }}
                >
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-rose-400">N</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">S</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">E</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</span>

                  {/* Dial ticks */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <div
                      key={deg}
                      className="absolute top-0 left-1/2 w-0.5 h-2 bg-[#c8a951]/40 -translate-x-1/2 origin-bottom"
                      style={{ height: '8px', transform: `rotate(${deg}deg)`, transformOrigin: '50% 128px' }}
                    />
                  ))}
                </div>

                {/* Rotating Qibla Pointer */}
                <div
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-700 ease-out pointer-events-none"
                  style={{
                    transform: `rotate(${qibla.bearing - (deviceHeading || 0)}deg)`,
                  }}
                >
                  {/* Kaaba Arrow Pointer */}
                  <div className="absolute top-6 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#c8a951] border-2 border-white flex items-center justify-center shadow-lg text-white font-amiri text-sm font-bold animate-pulse">
                      🕋
                    </div>
                    <div className="w-1 h-16 bg-gradient-to-t from-transparent via-[#c8a951] to-[#c8a951]" />
                  </div>
                </div>

                {/* Center Hub */}
                <div className="w-14 h-14 rounded-full bg-[#0b3d2e] border-2 border-[#c8a951] flex flex-col items-center justify-center z-10 shadow-md">
                  <span className="font-mono text-xs font-bold text-[#f3e5ab]">{qibla.bearing}°</span>
                </div>
              </div>
            </div>

            {/* Qibla Details */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#c8a951]/20">
              <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/15">
                <span className="text-slate-400 block mb-1">{t.prayers.qiblaDirection}</span>
                <span className="font-mono text-lg font-bold text-[#f3e5ab]">{qibla.bearing}°</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">{qibla.directionCardinal}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/15">
                <span className="text-slate-400 block mb-1">{t.prayers.kaabaDistance}</span>
                <span className="font-mono text-lg font-bold text-[#f3e5ab]">{qibla.distanceKm.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{language === 'ar' ? 'كيلومتر' : 'km'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
