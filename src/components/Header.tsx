import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { gregorianToHijri } from '../utils/calendarEngine';
import { 
  Scale, 
  Coins, 
  Compass, 
  Moon, 
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
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
        {/* Top compact row: Logo, App Title, Hijri Date, Language Toggle */}
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

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#e6cb7a]/90 font-medium font-amiri sm:hidden">
              {hijriDate}
            </span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-medium cursor-pointer shadow-sm transition"
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
                className={`flex items-center shrink-0 gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#0b3d2e]/60'
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
        className="relative md:sticky md:top-0 z-40 bg-[#07261d]/90 backdrop-blur-md border-b border-[#c8a951]/20 shadow-lg no-print"
      >
        {/* Top Banner: Quranic motto & Live Dates */}
        <div className="bg-[#051a14]/80 border-b border-[#c8a951]/10 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Motto */}
            <div className="flex items-center gap-2 text-[#e6cb7a] font-amiri text-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#c8a951]" />
              <span>{t.motto}</span>
              <span className="text-[11px] opacity-75 hidden sm:inline">({t.mottoSurah})</span>
            </div>

            {/* Dates & Language toggle */}
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#c8a951]" />
                <span className="text-[#e6cb7a]">{hijriDate}</span>
                <span className="text-slate-500">|</span>
                <span className="hidden md:inline">{gregorianDate}</span>
              </div>

              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b3d2e] hover:bg-[#114d3a] border border-[#c8a951]/30 text-[#e6cb7a] text-xs font-medium transition cursor-pointer shadow-sm"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-[#c8a951]" />
                <span>{t.toggleLanguage}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Bar: Logo & Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b3d2e] to-[#051a14] border-2 border-[#c8a951] shadow-[0_0_15px_rgba(200,169,81,0.3)]">
                {/* Ornate Rub-el-Hizb */}
                <span className="font-amiri text-2xl text-[#f3e5ab] select-none">۞</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-amiri font-bold text-2xl md:text-3xl text-[#f3e5ab] tracking-wide leading-tight">
                    {t.appName}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1.5 pt-0.5">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Nav Tabs - flex-wrap ensures no tabs are cut off on any screen size */}
            <nav className="flex flex-wrap items-center gap-1.5 md:gap-2 justify-start xl:justify-end py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center shrink-0 gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] font-bold shadow-md shadow-[#c8a951]/20'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b3d2e]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#07261d]' : 'text-[#c8a951]'}`} />
                    <span>{item.label}</span>
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
