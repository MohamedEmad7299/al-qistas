import React, { useEffect, useState, useRef } from 'react';
import { Language, Theme } from '../types';
import { translations } from '../translations/translations';
import { gregorianToHijri } from '../utils/calendarEngine';
import { 
  Scale, 
  Coins, 
  Compass, 
  Moon, 
  Sun,
  ShieldAlert, 
  Hourglass, 
  TrendingUp, 
  Languages, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
}) => {
  const t = translations[language];
  const [hijriDate, setHijriDate] = useState<string>('');
  const [gregorianDate, setGregorianDate] = useState<string>('');

  // Mobile scroll animation state & refs
  const tallHeaderRef = useRef<HTMLElement>(null);
  const [isShortBarVisible, setIsShortBarVisible] = useState<boolean>(false);
  const isVisibleRef = useRef<boolean>(false);
  const lastScrollYRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);
  const scrollDirectionRef = useRef<'up' | 'down' | null>(null);
  const headerHeightRef = useRef<number>(0);

  useEffect(() => {
    const today = new Date();
    const h = gregorianToHijri(today);
    setHijriDate(language === 'ar' ? h.formattedAr : h.formattedEn);
    setGregorianDate(
      today.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, [language]);

  // Scroll listener tracking mobile header visibility
  useEffect(() => {
    const SCROLL_THRESHOLD = 12;
    const MIN_DELTA = 0.5;

    const updateHeaderHeight = () => {
      if (tallHeaderRef.current) {
        headerHeightRef.current = tallHeaderRef.current.offsetHeight;
      }
    };

    // Measure after first layout
    updateHeaderHeight();

    // Use ResizeObserver to track dynamic height changes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && tallHeaderRef.current) {
      ro = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      ro.observe(tallHeaderRef.current);
    }

    const handleScroll = () => {
      // Only active on mobile view (< 768px)
      if (window.innerWidth >= 768) {
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsShortBarVisible(false);
        }
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
      const threshold = headerHeightRef.current || 160;
      const delta = currentScrollY - lastScrollYRef.current;

      // While scroll position is still inside the tall header, keep short bar hidden
      if (currentScrollY <= threshold) {
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsShortBarVisible(false);
        }
        accumulatedDeltaRef.current = 0;
        scrollDirectionRef.current = null;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Ignore movements smaller than 0.5px
      if (Math.abs(delta) < MIN_DELTA) {
        return;
      }

      const currentDirection = delta > 0 ? 'down' : 'up';

      // If direction flips, start the count over
      if (scrollDirectionRef.current !== currentDirection) {
        scrollDirectionRef.current = currentDirection;
        accumulatedDeltaRef.current = Math.abs(delta);
      } else {
        // Add up movement in current direction
        accumulatedDeltaRef.current += Math.abs(delta);
      }

      // 12px upward scroll shows the bar; 12px downward scroll hides it
      if (currentDirection === 'up' && accumulatedDeltaRef.current >= SCROLL_THRESHOLD) {
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsShortBarVisible(true);
        }
        accumulatedDeltaRef.current = 0; // Reset count after show
      } else if (currentDirection === 'down' && accumulatedDeltaRef.current >= SCROLL_THRESHOLD) {
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsShortBarVisible(false);
        }
        accumulatedDeltaRef.current = 0; // Reset count after hide
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeaderHeight);
      if (ro) ro.disconnect();
    };
  }, [language]);

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { id: 'inheritance', label: t.tabs.inheritance, icon: Scale },
    { id: 'zakat', label: t.tabs.zakat, icon: Coins },
    { id: 'prayers', label: t.tabs.prayers, icon: Compass },
    { id: 'calendar', label: t.tabs.calendar, icon: Moon },
    { id: 'kaffarah', label: t.tabs.kaffarah, icon: ShieldAlert },
    { id: 'iddah', label: t.tabs.iddah, icon: Hourglass },
    { id: 'finance', label: t.tabs.finance, icon: TrendingUp },
  ];

  return (
    <>
      {/* Floating Short Bar for Mobile View (< 768px) */}
      <div
        className={`mobile-short-bar fixed top-0 inset-x-0 z-50 md:hidden bg-[#07261d]/95 backdrop-blur-md rounded-b-2xl border-b-2 border-[#c8a951]/30 shadow-2xl pt-[env(safe-area-inset-top,0px)] mobile-short-bar no-print transition-all duration-300 ${
          isShortBarVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isShortBarVisible}
      >
        {/* Top compact row: Logo, App Title, Theme Toggle & Language Toggle */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3 border-b border-[#c8a951]/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#0b3d2e] to-[#051a14] border border-[#c8a951] shadow-sm shrink-0">
              <span className="font-amiri text-lg text-[#f3e5ab] select-none leading-none">۞</span>
            </div>
            <span className="font-amiri font-bold text-lg text-[#f3e5ab] leading-none truncate">
              {t.appName}
            </span>
            <span className="text-[11px] text-[#e6cb7a]/90 font-medium font-amiri hidden sm:inline truncate">
              {hijriDate}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] transition cursor-pointer shadow-sm active:scale-95"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-300" />
              )}
            </button>

            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-bold cursor-pointer shadow-sm transition active:scale-95"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#c8a951]" />
              <span>{t.toggleLanguage}</span>
            </button>
          </div>
        </div>

        {/* Compact horizontally scrollable navigation tabs with comfortable spacing */}
        <nav className="flex items-center gap-2.5 overflow-x-auto no-scrollbar px-4 py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center shrink-0 gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent shadow-md scale-105'
                    : 'bg-[#07261d]/85 text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951]/60 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#07261d]' : 'text-[#c8a951]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tall Main Header: scrolls away on mobile, sticky on desktop */}
      <header
        ref={tallHeaderRef}
        className="header-container relative md:sticky md:top-0 z-40 bg-[#07261d]/95 backdrop-blur-md border-b-2 border-[#c8a951]/25 shadow-2xl no-print transition-all duration-300"
      >
        {/* Top Banner: Quranic motto with respectful top space, Live Dates, Theme & Language toggles */}
        <div className="header-top-banner bg-[#051a14]/90 border-b border-[#c8a951]/15 px-6 sm:px-8 pt-6 sm:pt-7 pb-4 sm:pb-5 text-xs transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Motto with spacious, reverent top breathing room */}
            <div className="ayah-text flex items-center gap-3 text-[#e6cb7a] font-amiri text-base sm:text-lg md:text-xl">
              <Sparkles className="w-5 h-5 text-[#c8a951] shrink-0" />
              <span className="font-bold tracking-wide">{t.motto}</span>
              <span className="text-xs sm:text-sm opacity-80 hidden xl:inline">({t.mottoSurah})</span>
            </div>

            {/* Dates, Theme Toggle & Language Toggle */}
            <div className="flex flex-wrap items-center gap-3 text-slate-300 self-end md:self-auto">
              {/* Hijri and Gregorian Dates Pill */}
              <div className="header-pill-btn flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/25 text-xs sm:text-sm font-semibold shadow-xs">
                <Calendar className="w-4 h-4 text-[#c8a951]" />
                <span className="text-[#e6cb7a] font-bold font-amiri">{hijriDate}</span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="hidden sm:inline text-slate-300">{gregorianDate}</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="header-pill-btn flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/35 text-[#e6cb7a] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{t.lightMode}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-cyan-300" />
                    <span>{t.darkMode}</span>
                  </>
                )}
              </button>

              {/* Language Switcher Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="header-pill-btn flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/35 text-[#e6cb7a] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Change Language"
              >
                <Languages className="w-4 h-4 text-[#c8a951]" />
                <span>{t.toggleLanguage}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Bar: Prominent Larger Logo & Spacious Navigation */}
        <div className="header-main-bar max-w-7xl mx-auto px-6 sm:px-8 md:px-10 py-7 sm:py-8 md:py-10 transition-all duration-300">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 md:gap-8">
            {/* Logo & Platform Name (Larger & Much More Regal) */}
            <div className="flex items-center gap-5 sm:gap-6 shrink-0">
              <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0e4d3a] via-[#07261d] to-[#041410] border-2 sm:border-3 border-[#c8a951] shadow-[0_0_35px_rgba(200,169,81,0.45)] group shrink-0">
                {/* Ornate Rub-el-Hizb with inner glow */}
                <span className="font-amiri text-4xl sm:text-5xl md:text-6xl text-[#f3e5ab] select-none leading-none group-hover:scale-110 transition-transform">۞</span>
                {/* Corner ornamental accents */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-[#c8a951]/70 rounded-full" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c8a951]/70 rounded-full" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-[#c8a951]/70 rounded-full" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-[#c8a951]/70 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-3.5">
                  <h1 className="brand-title font-amiri font-bold text-4xl sm:text-5xl md:text-6xl text-[#f3e5ab] tracking-wider leading-tight">
                    {t.appName}
                  </h1>
                  <span className="brand-badge px-3 py-1 rounded-full bg-[#c8a951]/20 border border-[#c8a951]/40 text-[#e6cb7a] text-xs sm:text-sm font-bold shadow-xs">
                    v2.0
                  </span>
                </div>
                <p className="brand-subtitle text-sm sm:text-base md:text-lg text-slate-300 font-medium mt-2 leading-relaxed">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Nav Tabs - Larger Segmented Buttons with Comfortable Spacing */}
            <nav className="flex flex-wrap items-center gap-3 sm:gap-3.5 md:gap-4 justify-start xl:justify-end py-1" role="tablist">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-tab-item flex items-center shrink-0 gap-2.5 px-4.5 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-2xl text-xs sm:text-sm md:text-base font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? 'nav-tab-active bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent shadow-[0_6px_20px_rgba(200,169,81,0.4)] ring-2 ring-[#c8a951]/50 scale-[1.04]'
                        : 'nav-tab-inactive bg-[#0b3d2e]/75 text-slate-200 border-[#c8a951]/25 hover:border-[#c8a951]/70 hover:text-white hover:bg-[#114d3a] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 transition-transform ${isActive ? 'text-[#07261d]' : 'text-[#c8a951]'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#07261d] inline-block ms-1 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
