import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { calculateKaffarah } from '../utils/kaffarahEngine';
import { ShieldAlert, Sparkles, CheckCircle2, FileText, Coins, ChevronDown } from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: any) => void;
}

const cleanNumberInput = (val: string, maxDigits = 12, maxVal?: number): string => {
  if (!val) return '';
  const cleaned = val.replace(/^0+(?=\d)/, '');
  const parts = cleaned.split('.');
  if (parts[0].length > maxDigits) {
    parts[0] = parts[0].slice(0, maxDigits);
  }
  let res = parts[0];
  if (parts.length > 1) {
    res = parts[0] + '.' + parts.slice(1).join('').slice(0, 2);
  }
  if (maxVal !== undefined && maxVal >= 0 && res !== '' && Number(res) > maxVal) {
    return String(maxVal);
  }
  return res;
};

export const KaffarahCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [type, setType] = useState<'oath' | 'fast_breach' | 'fidyah' | 'diyah'>('oath');
  const [mealPrice, setMealPrice] = useState<number | string>('');
  const [missedDays, setMissedDays] = useState<number | string>('');
  const [goldPrice, setGoldPrice] = useState<number | string>('');
  const [currency, setCurrency] = useState<string>('EGP');

  const currencies = ['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP', 'KWD', 'QAR', 'MAD', 'TRY', 'IDR'];

  const result = useMemo(() => {
    return calculateKaffarah({
      type,
      mealPrice: Number(mealPrice) || 0,
      missedDays: Number(missedDays) || 0,
      currency,
      goldPricePerGram: Number(goldPrice) || 0,
    });
  }, [type, mealPrice, missedDays, currency, goldPrice]);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'التكفير عن الخطايا والديات' : 'Atonement & Compensations'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.kaffarah.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {t.kaffarah.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#e6cb7a]">{t.currency}:</span>
            <div className="relative inline-flex items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-[#07261d] border border-[#c8a951]/40 text-[#f3e5ab] text-xs font-bold rounded-lg ps-3.5 pe-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#c8a951] absolute end-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
              {language === 'ar' ? 'نوع الكفارة أو الدية' : 'Type of Atonement / Compensation'}
            </h3>

            <div className="space-y-3">
              {[
                { id: 'oath', label: t.kaffarah.types.oath },
                { id: 'fast_breach', label: t.kaffarah.types.fastBreach },
                { id: 'fidyah', label: t.kaffarah.types.fidyah },
                { id: 'diyah', label: t.kaffarah.types.diyah },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as any)}
                  className={`w-full p-3.5 rounded-xl text-xs md:text-sm font-bold border transition-all text-start cursor-pointer flex items-center justify-between active:scale-95 ${
                    type === opt.id
                      ? 'bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent font-bold shadow-md ring-2 ring-[#c8a951]/40 scale-[1.01]'
                      : 'bg-[#07261d] text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951]/60 hover:text-white hover:bg-[#0b3d2e] hover:-translate-y-0.5'
                  }`}
                >
                  <span>{opt.label}</span>
                  {type === opt.id && <CheckCircle2 className="w-4 h-4 text-[#07261d]" />}
                </button>
              ))}
            </div>

            {/* Price parameters */}
            <div className="space-y-3 pt-3 border-t border-[#c8a951]/20">
              {type !== 'diyah' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'تكلفة الوجبة أو المُد نقداً' : 'Cost per meal / Mudd'} ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999999"
                    value={mealPrice === 0 || mealPrice === '0' || mealPrice === '' ? '' : mealPrice}
                    onChange={(e) => setMealPrice(cleanNumberInput(e.target.value, 6))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              )}

              {type === 'fidyah' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'عدد أيام الإفطار' : 'Number of Missed Days'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={missedDays === 0 || missedDays === '0' || missedDays === '' ? '' : missedDays}
                    onChange={(e) => setMissedDays(cleanNumberInput(e.target.value, 4, 9999))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              )}

              {type === 'diyah' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'سعر جرام الذهب عيار 24' : 'Gold 24k Price / Gram'} ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999999"
                    value={goldPrice === 0 || goldPrice === '0' || goldPrice === '' ? '' : goldPrice}
                    onChange={(e) => setGoldPrice(cleanNumberInput(e.target.value, 6))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Details & Legal Proof (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0b3d2e]/90 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <h3 className="font-amiri font-bold text-xl text-[#f3e5ab]">
                {language === 'ar' ? result.titleAr : result.titleEn}
              </h3>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'kaffarah', result, currency })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.exportPdf}</span>
              </button>
            </div>

            {/* Primary obligation card */}
            <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/30 space-y-1">
              <span className="text-[11px] text-[#e6cb7a] block font-bold uppercase tracking-wider">
                {language === 'ar' ? 'المقدار الواجب شرعاً' : 'Primary Legal Obligation'}
              </span>
              <p className="font-amiri text-lg font-bold text-white">
                {language === 'ar' ? result.primaryObligationAr : result.primaryObligationEn}
              </p>
            </div>

            {/* Key figures grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {result.mealsCount > 0 && (
                <div className="p-3 rounded-xl bg-[#051a14]/80 border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                  <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'عدد الوجبات' : 'Meals Count'}</span>
                  <span className="font-amiri text-2xl font-bold text-[#f3e5ab] mt-0.5 block truncate">{result.mealsCount}</span>
                </div>
              )}

              {result.foodQuantityKg > 0 && (
                <div className="p-3 rounded-xl bg-[#051a14]/80 border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                  <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'كمية الحبوب' : 'Staples Weight'}</span>
                  <span className="font-amiri text-2xl font-bold text-[#f3e5ab] mt-0.5 block truncate">{result.foodQuantityKg} {language === 'ar' ? 'كجم' : 'kg'}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#051a14]/80 border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'التقدير النقدي' : 'Cash Value'}</span>
                <span
                  className="font-amiri text-2xl font-bold text-emerald-300 mt-0.5 block truncate"
                  title={`${Math.round(result.estimatedCost).toLocaleString()} ${currency}`}
                >
                  {Math.round(result.estimatedCost).toLocaleString()} <span className="text-xs font-sans">{currency}</span>
                </span>
              </div>
            </div>

            {/* Quranic reference quote */}
            <div className="p-4 rounded-xl bg-[#051a14]/90 border-s-4 border-[#c8a951] font-amiri text-sm text-[#f3e5ab] leading-relaxed">
              {language === 'ar' ? result.quranicRefAr : result.quranicRefEn}
            </div>

            {/* Explanatory points */}
            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-bold text-[#e6cb7a] block">{t.notes}:</span>
              {(language === 'ar' ? result.detailsAr : result.detailsEn).map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#07261d]/60 p-2.5 rounded-lg border border-[#c8a951]/10">
                  <span className="text-[#c8a951] font-bold">•</span>
                  <p className="leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
