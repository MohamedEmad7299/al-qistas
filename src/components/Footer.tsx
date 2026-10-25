import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { Heart, BookOpen } from 'lucide-react';

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

        {/* Bottom Line: Copyright & Developer Contact Bar */}
        <div className="pt-6 border-t border-[#c8a951]/15 flex flex-col md:flex-row items-center justify-between w-full text-xs text-slate-400 gap-4">
          <p className="text-slate-500">
            © {new Date().getFullYear()} {language === 'ar' ? 'منصة القسطاس - جميع الحقوق متاحة للنشر والخير' : 'Al-Qistas - Open Source Public Utility'}
          </p>

          {/* Developer Credit & Contact Bar as made in restaurant menu */}
          <div className="flex flex-wrap items-center gap-3 bg-[#07261d]/80 px-4 py-2 rounded-2xl border border-[#c8a951]/30 shadow-md">
            <span className="text-[#e6cb7a] font-medium text-xs">
              {language === 'ar' ? 'تصميم وتطوير:' : 'Designed & Developed by:'}
            </span>
            <span className="font-bold text-[#f3e5ab] text-sm tracking-wide">
              Mohamed Emad
            </span>

            <div className="flex items-center gap-2 pr-1 rtl:pr-0 rtl:pl-1 border-r rtl:border-r-0 rtl:border-l border-[#c8a951]/20">
              {/* Telephone */}
              <a
                href="tel:+201020766525"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#c8a951] text-[#f3e5ab] hover:text-[#07261d] flex items-center justify-center transition border border-[#c8a951]/30"
                title={language === 'ar' ? 'اتصال هاتفي: 01020766525' : 'Call: +201020766525'}
                aria-label="Phone"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/201020766525"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#25D366] text-[#f3e5ab] hover:text-white flex items-center justify-center transition border border-[#c8a951]/30"
                title={language === 'ar' ? 'واتساب: 01020766525' : 'WhatsApp: +201020766525'}
                aria-label="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 2C6.5 2 2 6.5 2 12.03c0 1.97.57 3.8 1.55 5.35L2.24 21.76l4.55-1.28c1.5 1 3.28 1.55 5.24 1.55 5.53 0 10.03-4.5 10.03-10.03 0-5.53-4.5-10-10.03-10zm0 18.35c-1.74 0-3.37-.48-4.78-1.33l-.34-.21-2.7.76.73-2.63-.23-.37c-.94-1.46-1.47-3.18-1.47-4.99 0-4.6 3.74-8.35 8.35-8.35 4.6 0 8.35 3.74 8.35 8.35 0 4.61-3.75 8.35-8.35 8.35zm4.83-6.24c-.26-.13-1.57-.77-1.81-.86-.25-.09-.43-.13-.61.13-.18.26-.7 8.86-.86 1.05-.16.18-.32.21-.59.08-.26-.13-1.12-.41-2.13-1.32-.79-.7-1.32-1.57-1.47-1.83-.16-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.16.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.61-1.48-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2 0 1.3 1.03 2.56 1.18 2.74.15.18 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.32.19 1.82.12.55-.08 1.57-.64 1.79-1.26.22-.61.22-1.14.15-1.26-.06-.11-.24-.18-.5-.31z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/mohamedemad199912"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#1877F2] text-[#f3e5ab] hover:text-white flex items-center justify-center transition border border-[#c8a951]/30"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/ma7amed_3emad/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#E4405F] text-[#f3e5ab] hover:text-white flex items-center justify-center transition border border-[#c8a951]/30"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/feed/foryou/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-[#0A66C2] text-[#f3e5ab] hover:text-white flex items-center justify-center transition border border-[#c8a951]/30"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/MohamedEmad7299"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#0b3d2e] hover:bg-black text-[#f3e5ab] hover:text-white flex items-center justify-center transition border border-[#c8a951]/30"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
