import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCw
} from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: { type: 'imsakiya'; prayers: PrayerTimeItem[]; city: string; qibla: QiblaInfo }) => void;
}

export const PrayerTimesAndQibla: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  // Location permission state: strictly gate Qibla direction
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [isRequestingLocation, setIsRequestingLocation] = useState<boolean>(false);

  // Coordinates & city state
  const [selectedCityIndex, setSelectedCityIndex] = useState<number>(0);
  const [lat, setLat] = useState<number>(MAJOR_WORLD_CITIES[0].lat);
  const [lng, setLng] = useState<number>(MAJOR_WORLD_CITIES[0].lng);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(MAJOR_WORLD_CITIES[0].tz);
  const [cityName, setCityName] = useState<string>(MAJOR_WORLD_CITIES[0].nameAr);

  // User's verified GPS coordinates
  const [userGpsLat, setUserGpsLat] = useState<number | null>(null);
  const [userGpsLng, setUserGpsLng] = useState<number | null>(null);

  const [method, setMethod] = useState<'MWL' | 'Egypt' | 'UmmAlQura' | 'ISNA' | 'Karachi'>('Egypt');
  const [asrJuristic, setAsrJuristic] = useState<'standard' | 'hanafi'>('standard');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);

  // Vibration throttle ref
  const lastVibratedRef = useRef<number>(0);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request GPS Location function
  const requestLocation = (isUserInitiated: boolean = false) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationPermission('denied');
      if (isUserInitiated) {
        alert(language === 'ar' ? 'خاصية تحديد الموقع غير مدعومة في متصفحك' : 'Geolocation is not supported by your browser.');
      }
      return;
    }

    setIsRequestingLocation(true);
    setLocationPermission('requesting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserGpsLat(userLat);
        setUserGpsLng(userLng);
        setLat(userLat);
        setLng(userLng);

        // System timezone offset
        const tz = -new Date().getTimezoneOffset() / 60;
        setTimezoneOffset(tz);

        const latFmt = Math.abs(userLat).toFixed(2) + '°' + (userLat >= 0 ? 'N' : 'S');
        const lngFmt = Math.abs(userLng).toFixed(2) + '°' + (userLng >= 0 ? 'E' : 'W');
        setCityName(language === 'ar' ? `موقعي الحالي (GPS: ${latFmt}, ${lngFmt})` : `My Location (GPS: ${latFmt}, ${lngFmt})`);

        setLocationPermission('granted');
        setIsRequestingLocation(false);

        // Store granted status
        try {
          localStorage.setItem('alqistas_gps_granted', 'true');
        } catch (e) {
          // ignore localStorage error
        }

        // Setup orientation listeners
        setupOrientationListeners();
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsRequestingLocation(false);
        setLocationPermission('denied');
        try {
          localStorage.removeItem('alqistas_gps_granted');
        } catch (e) {
          // ignore
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Check permission on mount and ask user for location access
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'granted') {
          requestLocation(false);
        } else if (status.state === 'denied') {
          setLocationPermission('denied');
        } else {
          // 'prompt' state - automatically prompt user for location access
          setLocationPermission('prompt');
          requestLocation(false);
        }

        status.onchange = () => {
          if (status.state === 'granted') {
            requestLocation(false);
          } else if (status.state === 'denied') {
            setLocationPermission('denied');
          }
        };
      }).catch(() => {
        requestLocation(false);
      });
    } else {
      // Fallback for browsers without navigator.permissions
      requestLocation(false);
    }
  }, []);

  // Setup device orientation for accurate mobile compass
  const setupOrientationListeners = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // 1. iOS Safari uses webkitCompassHeading directly (0° = North, clockwise)
      if (typeof (e as any).webkitCompassHeading === 'number') {
        heading = (e as any).webkitCompassHeading;
      } 
      // 2. Android Chrome / W3C deviceorientationabsolute / absolute orientation
      else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(Math.round(heading));
        setHasCompassSensor(true);
      }
    };

    const win = window as any;
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handleOrientation, true);
    } else if (win.DeviceOrientationEvent) {
      win.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  // iOS 13+ requires explicit user gesture to request motion sensor permission
  const handleEnableCompassSensor = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setupOrientationListeners();
        } else {
          alert(language === 'ar' ? 'تم رفض إذن مستشعر البوصلة' : 'Compass sensor permission was denied');
        }
      } catch (err) {
        console.warn('iOS motion sensor request error:', err);
      }
    } else {
      setupOrientationListeners();
    }
  };

  const handleCityChange = (index: number) => {
    setSelectedCityIndex(index);
    const c = MAJOR_WORLD_CITIES[index];
    setLat(c.lat);
    setLng(c.lng);
    setTimezoneOffset(c.tz);
    setCityName(language === 'ar' ? c.nameAr : c.nameEn);
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

  // Accurate Qibla calculation based on verified GPS coordinates when granted, or current lat/lng
  const qibla = useMemo(() => {
    const qLat = userGpsLat !== null ? userGpsLat : lat;
    const qLng = userGpsLng !== null ? userGpsLng : lng;
    return calculateQibla(qLat, qLng);
  }, [userGpsLat, userGpsLng, lat, lng]);

  // Relative heading difference to Kaaba
  const { bearingDiff, isFacingQibla } = useMemo(() => {
    if (deviceHeading === null) {
      return { bearingDiff: 0, isFacingQibla: false };
    }
    let diff = (qibla.bearing - deviceHeading) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return {
      bearingDiff: diff,
      isFacingQibla: Math.abs(diff) <= 5,
    };
  }, [qibla.bearing, deviceHeading]);

  // Haptic feedback when device aligns with Qibla
  useEffect(() => {
    if (isFacingQibla && locationPermission === 'granted') {
      if (Date.now() - lastVibratedRef.current > 3000) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([40, 30, 40]);
          } catch (e) {
            // ignore vibrate errors
          }
        }
        lastVibratedRef.current = Date.now();
      }
    }
  }, [isFacingQibla, locationPermission]);

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
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl pointer-events-none" />
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
              onClick={() => {
                handleEnableCompassSensor();
                requestLocation(true);
              }}
              disabled={isRequestingLocation}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
                locationPermission === 'granted'
                  ? 'bg-[#0f4d39] border-emerald-400/50 text-[#f3e5ab]'
                  : 'bg-[#0b3d2e] hover:bg-[#114d3a] border-[#c8a951]/40 text-[#f3e5ab]'
              }`}
            >
              {isRequestingLocation ? (
                <Loader2 className="w-4 h-4 text-[#c8a951] animate-spin" />
              ) : (
                <MapPin className={`w-4 h-4 ${locationPermission === 'granted' ? 'text-emerald-400' : 'text-[#c8a951]'}`} />
              )}
              <span>{isRequestingLocation ? t.prayers.requestingLocation : t.prayers.locateMe}</span>
              {locationPermission === 'granted' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
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

      {/* Prominent Location Banner if Permission is not granted */}
      {locationPermission !== 'granted' && (
        <div className="p-4 rounded-2xl bg-[#07261d]/90 border border-[#c8a951]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 text-start">
            <div className="w-10 h-10 rounded-xl bg-[#0b3d2e] border border-[#c8a951]/40 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#c8a951]" />
            </div>
            <div>
              <span className="font-amiri font-bold text-base text-[#f3e5ab] block">
                {language === 'ar' ? 'تفعيل إذن الموقع الجغرافي (GPS)' : 'Enable Location Permission (GPS)'}
              </span>
              <span className="text-xs text-slate-300">
                {language === 'ar'
                  ? 'يلزم منح إذن الموقع لحساب اتجاه القبلة الصحيح بدقة وتفعيل البوصلة لموقعك الحالي.'
                  : 'Location access is required to compute accurate Qibla bearing and unlock the compass.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleEnableCompassSensor();
              requestLocation(true);
            }}
            disabled={isRequestingLocation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition shrink-0 cursor-pointer"
          >
            {isRequestingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-[#07261d]" />}
            <span>{isRequestingLocation ? t.prayers.requestingLocation : t.prayers.grantLocationBtn}</span>
          </button>
        </div>
      )}

      {/* Main Grid: Countdown + Daily Schedule (7 cols) and Qibla Compass (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Countdowns & Times (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Next Prayer Live Countdown Hero */}
          <div className="emerald-card p-6 rounded-2xl border-2 border-[#c8a951]/40 shadow-xl relative overflow-hidden">
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
                      ? 'next-prayer-active bg-gradient-to-br from-[#0e4d3a] to-[#07261d] border-[#c8a951] shadow-lg scale-[1.02]'
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

        {/* Right Column: Qibla Compass (Locked until permission granted) */}
        <div className="lg:col-span-5 space-y-6">
          {locationPermission !== 'granted' ? (
            /* LOCKED QIBLA COMPASS CARD */
            <div className="qibla-locked-card bg-[#0b3d2e]/85 border-2 border-[#c8a951]/40 rounded-2xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#c8a951]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Big Lock Icon with animated Kaaba glow */}
                <div className="qibla-locked-icon-sphere relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#07261d] to-[#041410] border-2 border-[#c8a951] flex items-center justify-center shadow-[0_0_30px_rgba(200,169,81,0.3)]">
                  <div className="absolute inset-2 rounded-full border border-dashed border-[#c8a951]/40 animate-[spin_20s_linear_infinite]" />
                  <Lock className="w-10 h-10 text-[#f3e5ab]" />
                </div>

                <div>
                  <h3 className="font-amiri font-bold text-xl md:text-2xl text-[#f3e5ab]">
                    {t.prayers.qiblaLockedTitle}
                  </h3>
                  <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                    {t.prayers.qiblaLockedDesc}
                  </p>
                </div>

                {/* Primary CTA: Grant Location Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleEnableCompassSensor();
                      requestLocation(true);
                    }}
                    disabled={isRequestingLocation}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c8a951] via-[#e6cb7a] to-[#b39238] text-[#07261d] font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    {isRequestingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t.prayers.requestingLocation}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 text-[#07261d]" />
                        <span>{t.prayers.grantLocationBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Denied Warning Box if user previously blocked */}
                {locationPermission === 'denied' && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs text-start flex items-start gap-2.5 mt-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {t.prayers.locationPermissionDenied}
                    </div>
                  </div>
                )}

                {/* Notice explaining sharia accuracy requirement */}
                <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/20 text-[11px] text-slate-400">
                  <span className="text-[#e6cb7a] font-bold block mb-0.5">
                    {language === 'ar' ? '💡 لماذا نشترط تفعيل الموقع؟' : '💡 Why is location required?'}
                  </span>
                  <span>
                    {language === 'ar'
                      ? 'تختلف زاوية القبلة من مدينة لأخرى حتى داخل نفس الدولة بعشرات الدرجات، ولا يمكن توجيه البوصلة بشكل صحيح شرعاً إلا بإحداثيات موقعك الحقيقي.'
                      : 'Qibla bearing varies significantly between cities (by up to dozens of degrees). Accurate calculation strictly requires your real GPS coordinates.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED INTERACTIVE QIBLA COMPASS */
            <div className="qibla-unlocked-card bg-[#0b3d2e]/80 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 text-center relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
                <span className="font-amiri font-bold text-lg text-[#f3e5ab] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#c8a951]" />
                  <span>{language === 'ar' ? 'بوصلة اتجاه القبلة (GPS دقيق)' : 'Interactive Qibla Compass (GPS)'}</span>
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

              {/* Live Guidance Status Indicator */}
              {isFacingQibla ? (
                <div className="py-2.5 px-4 rounded-xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.prayers.facingQibla}</span>
                </div>
              ) : deviceHeading !== null ? (
                <div className="py-2.5 px-4 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/30 text-[#f3e5ab] font-bold text-xs flex items-center justify-center gap-2">
                  <Navigation className={`w-4 h-4 text-[#c8a951] transition-transform ${bearingDiff > 0 ? 'rotate-90' : '-rotate-90'}`} />
                  <span>
                    {bearingDiff > 0
                      ? `${t.prayers.turnRight} ${Math.round(bearingDiff)}°`
                      : `${t.prayers.turnLeft} ${Math.round(Math.abs(bearingDiff))}°`}
                  </span>
                </div>
              ) : (
                <div className="py-2 px-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/20 text-slate-300 text-[11px] leading-relaxed">
                  {t.prayers.staticCompassNotice}
                </div>
              )}

              {/* Compass Visualization */}
              <div className="flex justify-center py-4">
                <div
                  className={`qibla-compass-dial relative w-64 h-64 rounded-full bg-gradient-to-br from-[#07261d] via-[#051a14] to-[#041410] border-4 transition-all duration-300 flex items-center justify-center ${
                    isFacingQibla
                      ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)]'
                      : 'border-[#c8a951] shadow-[0_0_25px_rgba(200,169,81,0.25)]'
                  }`}
                >
                  {/* Degree markings on dial (rotates with device heading) */}
                  <div
                    className="absolute inset-0 rounded-full transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${deviceHeading !== null ? -deviceHeading : 0}deg)` }}
                  >
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-extrabold text-rose-400">N</span>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">S</span>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">E</span>
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</span>

                    {/* Dial ticks */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <div
                        key={deg}
                        className="absolute top-0 left-1/2 w-0.5 h-2.5 bg-[#c8a951]/40 -translate-x-1/2 origin-bottom"
                        style={{ height: '10px', transform: `rotate(${deg}deg)`, transformOrigin: '50% 128px' }}
                      />
                    ))}
                  </div>

                  {/* Rotating Qibla Pointer */}
                  <div
                    className="absolute w-full h-full flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
                    style={{
                      transform: `rotate(${deviceHeading !== null ? (qibla.bearing - deviceHeading) : qibla.bearing}deg)`,
                    }}
                  >
                    {/* Kaaba Arrow Pointer */}
                    <div className="absolute top-5 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg font-amiri text-sm font-bold border-2 transition-all ${
                          isFacingQibla
                            ? 'bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/50'
                            : 'bg-[#c8a951] border-white text-white shadow-black/40'
                        }`}
                      >
                        🕋
                      </div>
                      <div
                        className={`w-1 h-14 bg-gradient-to-t from-transparent ${
                          isFacingQibla ? 'via-emerald-400 to-emerald-400' : 'via-[#c8a951] to-[#c8a951]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Center Hub */}
                  <div
                    className={`qibla-compass-hub w-14 h-14 rounded-full bg-[#0b3d2e] border-2 flex flex-col items-center justify-center z-10 shadow-md transition-colors ${
                      isFacingQibla ? 'border-emerald-400 bg-[#063324]' : 'border-[#c8a951]'
                    }`}
                  >
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

              {/* Location verified notice & re-calibrate sensor */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.prayers.locationGrantedNotice}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    handleEnableCompassSensor();
                    requestLocation(true);
                  }}
                  className="inline-flex items-center gap-1 text-[#e6cb7a] hover:underline cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{language === 'ar' ? 'تحديث الإحداثيات' : 'Refresh GPS'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
