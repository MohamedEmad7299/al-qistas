import React, { useEffect, useState } from 'react';
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
    <header className="sticky top-0 z-40 bg-[#07261d]/90 backdrop-blur-md border-b border-[#c8a951]/20 shadow-lg">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
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

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] font-bold shadow-md shadow-[#c8a951]/20'
                      : 'text-slate-300 hover:text-white hover:bg-[#0b3d2e]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#07261d]' : 'text-[#c8a951]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
