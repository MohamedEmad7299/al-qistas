import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { Heart, BookOpen, ExternalLink } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="mt-20 border-t border-[#c8a951]/20 bg-[#041410] text-slate-400 py-12 px-4 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Bismillah Calligraphy */}
        <div className="font-amiri text-2xl md:text-3xl text-[#c8a951]">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Brand & Dedication */}
        <div className="max-w-2xl">
          <p className="font-amiri text-lg text-slate-200">
            {t.appName} — {t.appSubtitle}
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {language === 'ar'
              ? 'مبني وفق الضوابط الشرعية المعتمدة في الفقه الإسلامي ومجامع الفقه الكبرى (الأزهر الشريف، مجمع الفقه الإسلامي الدولي، وهيئة كبار العلماء). تم تصميم وبرمجة المنصة لوجه الله تعالى لتكون مرجعاً سهلاً ودقيقاً لكل مسلم.'
              : 'Constructed according to the authenticated legal rulings of the major Islamic Jurisprudence Academies. Designed and programmed for the sake of Allah to serve as an accessible, accurate digital companion for Muslims worldwide.'}
          </p>
        </div>

        {/* Badges / Credits */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#07261d] border border-[#c8a951]/30 text-[#e6cb7a]">
            <BookOpen className="w-3.5 h-3.5 text-[#c8a951]" />
            <span>{language === 'ar' ? 'فقه المذاهب الأربعة' : 'Four Sunni Madh\'habs'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#07261d] border border-[#c8a951]/30 text-[#e6cb7a]">
            <span className="text-[#c8a951]">★</span>
            <span>{language === 'ar' ? 'حسابات فلكية دقيقة' : 'Astronomical Solar Math'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#07261d] border border-[#c8a951]/30 text-[#e6cb7a]">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{language === 'ar' ? 'وقف خيري مجاني' : 'Free & Open Islamic Waqf'}</span>
          </div>
        </div>

        {/* GitHub link */}
        <div className="pt-4 border-t border-[#c8a951]/10 flex flex-col sm:flex-row items-center justify-between w-full text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Al-Qistas. {language === 'ar' ? 'جميع الحقوق متاحة للنشر والخير' : 'Open Source Public Utility'}</p>
          
          <a
            href="https://github.com/MohamedEmad7299/al-qistas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-400 hover:text-[#c8a951] transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

