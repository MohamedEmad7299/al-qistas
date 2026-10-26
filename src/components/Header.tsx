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
      const threshold = headerHeightRef.current || 120;
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
        className={`fixed top-0 inset-x-0 z-50 md:hidden bg-[#07261d]/95 backdrop-blur-md rounded-b-2xl border-b border-[#c8a951]/30 shadow-2xl pt-[env(safe-area-inset-top,0px)] mobile-short-bar no-print ${
          isShortBarVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isShortBarVisible}
      >
        {/* Top compact row: Logo, App Title, Theme Toggle & Language Toggle */}
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between gap-2 border-b border-[#c8a951]/15">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#0b3d2e] to-[#051a14] border border-[#c8a951] shadow-sm shrink-0">
              <span className="font-amiri text-base text-[#f3e5ab] select-none leading-none">۞</span>
            </div>
            <span className="font-amiri font-bold text-lg text-[#f3e5ab] leading-none truncate">
              {t.appName}
            </span>
            <span className="text-[11px] text-[#e6cb7a]/90 font-medium font-amiri hidden sm:inline truncate">
              {hijriDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] transition cursor-pointer shadow-sm active:scale-95"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-300" />
              )}
            </button>

            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-semibold cursor-pointer shadow-sm transition active:scale-95"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-[#c8a951]" />
              <span>{t.toggleLanguage}</span>
            </button>
          </div>
        </div>

        {/* Compact horizontally scrollable navigation tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center shrink-0 gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent shadow-md scale-105'
                    : 'bg-[#07261d]/80 text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/50 hover:text-white'
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
        className="relative md:sticky md:top-0 z-40 bg-[#07261d]/90 backdrop-blur-md border-b border-[#c8a951]/20 shadow-xl no-print"
      >
        {/* Top Banner: Quranic motto, Live Dates, Theme & Language toggles */}
        <div className="bg-[#051a14]/85 border-b border-[#c8a951]/15 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Motto */}
            <div className="flex items-center gap-2 text-[#e6cb7a] font-amiri text-sm">
              <Sparkles className="w-4 h-4 text-[#c8a951] shrink-0" />
              <span className="font-semibold">{t.motto}</span>
              <span className="text-[11px] opacity-80 hidden lg:inline">({t.mottoSurah})</span>
            </div>

            {/* Dates, Theme Toggle & Language Toggle */}
            <div className="flex items-center gap-3 text-slate-300">
              {/* Hijri and Gregorian Dates Pill */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#07261d]/80 border border-[#c8a951]/20 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#c8a951]" />
                <span className="text-[#e6cb7a] font-bold font-amiri">{hijriDate}</span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="hidden sm:inline text-slate-300">{gregorianDate}</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">{t.lightMode}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="hidden sm:inline">{t.darkMode}</span>
                  </>
                )}
              </button>

              {/* Language Switcher Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-[#c8a951]" />
                <span>{t.toggleLanguage}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Bar: Logo & Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-3.5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0b3d2e] via-[#07261d] to-[#041410] border-2 border-[#c8a951] shadow-[0_0_20px_rgba(200,169,81,0.35)] group">
                {/* Ornate Rub-el-Hizb with inner glow */}
                <span className="font-amiri text-2xl text-[#f3e5ab] select-none leading-none group-hover:scale-110 transition-transform">۞</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-amiri font-bold text-2xl md:text-3xl text-[#f3e5ab] tracking-wide leading-tight">
                    {t.appName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#c8a951]/20 border border-[#c8a951]/30 text-[#e6cb7a] text-[10px] font-bold">
                    v2.0
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Nav Tabs - Segmented Buttons with Unmistakable Clickability */}
            <nav className="flex flex-wrap items-center gap-1.5 md:gap-2 justify-start xl:justify-end py-1" role="tablist">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center shrink-0 gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent shadow-[0_4px_15px_rgba(200,169,81,0.35)] ring-2 ring-[#c8a951]/40 scale-[1.03]'
                        : 'bg-[#0b3d2e]/70 text-slate-200 border-[#c8a951]/20 hover:border-[#c8a951]/60 hover:text-white hover:bg-[#114d3a] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[#07261d]' : 'text-[#c8a951]'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#07261d] inline-block ms-0.5 animate-pulse" />
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
