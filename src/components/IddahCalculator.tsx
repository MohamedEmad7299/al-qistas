import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { calculateIddah } from '../utils/iddahEngine';
import { Hourglass, Sparkles, Calendar, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: any) => void;
}

const cleanNumberInput = (val: string, maxDigits = 2): string => {
  if (!val) return '';
  const cleaned = val.replace(/^0+(?=\d)/, '');
  return cleaned.slice(0, maxDigits);
};

export const IddahCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [type, setType] = useState<'widowhood' | 'divorce_cycle' | 'divorce_months' | 'pregnant'>('widowhood');
  const [startDateStr, setStartDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cycleDays, setCycleDays] = useState<number | string>('');
  const [deliveryDateStr, setDeliveryDateStr] = useState<string>('');

  const result = useMemo(() => {
    return calculateIddah({
      type,
      startDateStr,
      cycleLengthDays: Number(cycleDays) || 28,
      expectedDeliveryDateStr: deliveryDateStr,
    });
  }, [type, startDateStr, cycleDays, deliveryDateStr]);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'فقه الأسرة والأحوال الشخصية' : 'Islamic Family Law'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.iddah.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {t.iddah.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
              {language === 'ar' ? 'سبب العدة والحالة' : 'Iddah Reason & Condition'}
            </h3>

            <div className="space-y-2">
              {[
                { id: 'widowhood', label: t.iddah.widowhood },
                { id: 'divorce_cycle', label: t.iddah.divorceCycle },
                { id: 'divorce_months', label: t.iddah.divorceMonths },
                { id: 'pregnant', label: t.iddah.pregnant },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as any)}
                  className={`w-full p-3 rounded-xl text-xs md:text-sm font-semibold border transition text-start cursor-pointer flex items-center justify-between ${
                    type === opt.id
                      ? 'bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] border-[#c8a951] font-bold shadow-md'
                      : 'bg-[#07261d] text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  {type === opt.id && <CheckCircle2 className="w-4 h-4 text-[#07261d]" />}
                </button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="space-y-3 pt-3 border-t border-[#c8a951]/20">
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t.iddah.startDate}</label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              {type === 'divorce_cycle' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'متوسط طول الدورة الشهرية (أيام)' : 'Average cycle length (days)'}
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="45"
                    value={cycleDays === 0 || cycleDays === '0' || cycleDays === '' ? '' : cycleDays}
                    onChange={(e) => setCycleDays(cleanNumberInput(e.target.value))}
                    placeholder="28"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              )}

              {type === 'pregnant' && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'تاريخ الولادة المتوقع (إن وجد)' : 'Expected Delivery Date (optional)'}
                  </label>
                  <input
                    type="date"
                    value={deliveryDateStr}
                    onChange={(e) => setDeliveryDateStr(e.target.value)}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0b3d2e]/90 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <h3 className="font-amiri font-bold text-xl text-[#f3e5ab]">
                {language === 'ar' ? result.titleAr : result.titleEn}
              </h3>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'iddah', result })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.exportPdf}</span>
              </button>
            </div>

            {/* Result Timeline Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/25 space-y-1">
                <span className="text-[11px] text-slate-400 block">{t.iddah.startDate}</span>
                <span className="font-bold text-white text-sm block">
                  {result.startDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs text-[#e6cb7a] font-amiri block">{result.startDateHijri}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/30 space-y-1">
                <span className="text-[11px] text-[#e6cb7a] block font-bold">{t.iddah.endDate}</span>
                <span className="font-bold text-white text-sm block">
                  {result.endDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs text-[#f3e5ab] font-amiri block">{result.endDateHijri}</span>
              </div>
            </div>

            {/* Status & Days remaining */}
            <div className="p-4 rounded-xl bg-[#051a14]/80 border border-[#c8a951]/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300">{t.iddah.remainingDays}:</span>
                <span className="font-amiri font-bold text-2xl text-[#f3e5ab] mx-2">
                  {result.isCompleted ? 0 : result.remainingDays}
                </span>
                <span className="text-xs text-slate-400">{language === 'ar' ? 'يوم' : 'days'}</span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  result.isCompleted
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950 border-amber-500 text-amber-300'
                }`}
              >
                {result.isCompleted
                  ? language === 'ar' ? 'انقضت العدة شرعاً' : '\'Iddah Completed'
                  : language === 'ar' ? 'في فترة العدة' : 'Active In Waiting Period'}
              </span>
            </div>

            {/* Quranic evidence */}
            <div className="p-4 rounded-xl bg-[#051a14]/90 border-s-4 border-[#c8a951] font-amiri text-sm text-[#f3e5ab] leading-relaxed">
              {language === 'ar' ? result.quranicEvidenceAr : result.quranicEvidenceEn}
            </div>

            {/* Rulings checklist */}
            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-bold text-[#e6cb7a] block">{t.iddah.shariahRulings}:</span>
              {(language === 'ar' ? result.rulingsAr : result.rulingsEn).map((r, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#07261d]/60 p-2.5 rounded-lg border border-[#c8a951]/10">
                  <CheckCircle2 className="w-4 h-4 text-[#c8a951] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
