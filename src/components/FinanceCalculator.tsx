import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { 
  calculateMudarabah, 
  calculateMusharakah, 
  calculateMurabaha 
} from '../utils/financeEngine';
import { TrendingUp, Sparkles, CheckCircle2, AlertCircle, FileText, Scale, ChevronDown } from 'lucide-react';

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

export const FinanceCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [contractType, setContractType] = useState<'mudarabah' | 'musharakah' | 'murabaha'>('mudarabah');
  const [currency, setCurrency] = useState('EGP');

  // Mudarabah state - default blank
  const [mudarabahCapital, setMudarabahCapital] = useState<number | string>('');
  const [mudarabahProfitOrLoss, setMudarabahProfitOrLoss] = useState<number | string>('');
  const [mudarabahIsLoss, setMudarabahIsLoss] = useState<boolean>(false);
  const [rabbAlMalRatio, setRabbAlMalRatio] = useState<number>(70);

  // Musharakah state - default blank
  const [capitalA, setCapitalA] = useState<number | string>('');
  const [capitalB, setCapitalB] = useState<number | string>('');
  const [profitRatioA, setProfitRatioA] = useState<number>(60);
  const [musharakahProfitOrLoss, setMusharakahProfitOrLoss] = useState<number | string>('');
  const [musharakahIsLoss, setMusharakahIsLoss] = useState<boolean>(false);

  // Murabaha state - default blank
  const [assetCost, setAssetCost] = useState<number | string>('');
  const [marginPct, setMarginPct] = useState<number | string>('');
  const [tenorMonths, setTenorMonths] = useState<number | string>('');

  const mudarabahResult = useMemo(() => {
    return calculateMudarabah({
      capital: Number(mudarabahCapital) || 0,
      profitOrLoss: Number(mudarabahProfitOrLoss) || 0,
      isLoss: mudarabahIsLoss,
      rabbAlMalRatioPct: rabbAlMalRatio,
    });
  }, [mudarabahCapital, mudarabahProfitOrLoss, mudarabahIsLoss, rabbAlMalRatio]);

  const musharakahResult = useMemo(() => {
    return calculateMusharakah({
      capitalA: Number(capitalA) || 0,
      capitalB: Number(capitalB) || 0,
      profitRatioA,
      profitOrLoss: Number(musharakahProfitOrLoss) || 0,
      isLoss: musharakahIsLoss,
    });
  }, [capitalA, capitalB, profitRatioA, musharakahProfitOrLoss, musharakahIsLoss]);

  const murabahaResult = useMemo(() => {
    return calculateMurabaha({
      assetCost: Number(assetCost) || 0,
      marginPct: Number(marginPct) || 0,
      tenorMonths: Number(tenorMonths) || 0,
    });
  }, [assetCost, marginPct, tenorMonths]);

  const currencies = ['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP', 'KWD', 'QAR', 'MAD', 'TRY', 'IDR'];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'فقه المعاملات المالية والشراكات' : 'Islamic Financial Contracts'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.finance.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {t.finance.subtitle}
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

      {/* Contract Category Selection */}
      <div className="flex flex-wrap border-b border-[#c8a951]/20 gap-2.5 sm:gap-3.5 pb-3">
        {[
          { id: 'mudarabah', label: t.finance.mudarabah },
          { id: 'musharakah', label: t.finance.musharakah },
          { id: 'murabaha', label: t.finance.murabaha },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setContractType(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer border ${
              contractType === tab.id
                ? 'selection-active bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-white border-transparent shadow-[0_4px_15px_rgba(200,169,81,0.35)] ring-2 ring-[#c8a951]/40 scale-[1.03]'
                : 'selection-inactive bg-[#0b3d2e]/70 text-slate-200 border-[#c8a951]/20 hover:border-[#c8a951]/60 hover:text-white hover:bg-[#114d3a] hover:-translate-y-0.5 active:scale-95 shadow-xs'
            }`}
          >
            <span className={contractType === tab.id ? '!text-white' : ''}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mudarabah Inputs */}
          {contractType === 'mudarabah' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.finance.mudarabah}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'رأس مال رب المال' : 'Capital Provided by Rabb al-Mal'} ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999999999999"
                    value={mudarabahCapital === 0 || mudarabahCapital === '0' || mudarabahCapital === '' ? '' : mudarabahCapital}
                    onChange={(e) => setMudarabahCapital(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{language === 'ar' ? 'نسبة ربح رب المال' : 'Rabb al-Mal Profit Ratio'}:</span>
                    <span className="font-bold text-[#e6cb7a] progress-value">{rabbAlMalRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={rabbAlMalRatio}
                    onChange={(e) => setRabbAlMalRatio(Number(e.target.value))}
                    className="w-full accent-[#c8a951] progress-slider cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{language === 'ar' ? 'رب المال' : 'Capital'}: {rabbAlMalRatio}%</span>
                    <span>{language === 'ar' ? 'المضارب بالعمل' : 'Manager'}: {100 - rabbAlMalRatio}%</span>
                  </div>
                </div>

                {/* Profit or Loss Toggle */}
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setMudarabahIsLoss(false)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        !mudarabahIsLoss
                          ? 'selection-active bg-emerald-600 text-white border-emerald-500 shadow-md scale-[1.02]'
                          : 'selection-inactive bg-[#07261d] text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                      }`}
                    >
                      <span className={!mudarabahIsLoss ? '!text-white' : ''}>
                        {language === 'ar' ? 'تحقيق ربح' : 'Profit Incurred'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMudarabahIsLoss(true)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        mudarabahIsLoss
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-[1.02]'
                          : 'selection-inactive bg-[#07261d] text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                      }`}
                    >
                      <span className={mudarabahIsLoss ? '!text-white' : ''}>
                        {language === 'ar' ? 'تحقيق خسارة' : 'Loss Incurred'}
                      </span>
                    </button>
                  </div>

                  <label className="block text-xs text-slate-300 mb-1">
                    {mudarabahIsLoss
                      ? language === 'ar' ? 'مبلغ الخسارة' : 'Loss Amount'
                      : language === 'ar' ? 'مبلغ الربح المحقق' : 'Profit Amount'} ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={mudarabahProfitOrLoss === 0 || mudarabahProfitOrLoss === '0' || mudarabahProfitOrLoss === '' ? '' : mudarabahProfitOrLoss}
                    onChange={(e) => setMudarabahProfitOrLoss(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Musharakah Inputs */}
          {contractType === 'musharakah' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.finance.musharakah}
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.finance.capitalA}</label>
                    <input
                      type="number"
                      min="1"
                      max="999999999999"
                      value={capitalA === 0 || capitalA === '0' || capitalA === '' ? '' : capitalA}
                      onChange={(e) => setCapitalA(cleanNumberInput(e.target.value, 12))}
                      placeholder="0"
                      className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.finance.capitalB}</label>
                    <input
                      type="number"
                      min="1"
                      max="999999999999"
                      value={capitalB === 0 || capitalB === '0' || capitalB === '' ? '' : capitalB}
                      onChange={(e) => setCapitalB(cleanNumberInput(e.target.value, 12))}
                      placeholder="0"
                      className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{t.finance.agreedProfitRatio}:</span>
                    <span className="font-bold text-[#e6cb7a] progress-value">{profitRatioA}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={profitRatioA}
                    onChange={(e) => setProfitRatioA(Number(e.target.value))}
                    className="w-full accent-[#c8a951] progress-slider cursor-pointer"
                  />
                </div>

                {/* Profit or Loss Toggle */}
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setMusharakahIsLoss(false)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        !musharakahIsLoss
                          ? 'selection-active bg-emerald-600 text-white border-emerald-500 shadow-md scale-[1.02]'
                          : 'selection-inactive bg-[#07261d] text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                      }`}
                    >
                      <span className={!musharakahIsLoss ? '!text-white' : ''}>
                        {language === 'ar' ? 'ربح' : 'Profit'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMusharakahIsLoss(true)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        musharakahIsLoss
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-[1.02]'
                          : 'selection-inactive bg-[#07261d] text-slate-300 border-[#c8a951]/20 hover:border-[#c8a951]/40'
                      }`}
                    >
                      <span className={musharakahIsLoss ? '!text-white' : ''}>
                        {language === 'ar' ? 'خسارة' : 'Loss'}
                      </span>
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={musharakahProfitOrLoss === 0 || musharakahProfitOrLoss === '0' || musharakahProfitOrLoss === '' ? '' : musharakahProfitOrLoss}
                    onChange={(e) => setMusharakahProfitOrLoss(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Murabaha Inputs */}
          {contractType === 'murabaha' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.finance.murabaha}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'تكلفة شراء السلعة الأصلية' : 'Asset Purchase Cost'} ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999999999999"
                    value={assetCost === 0 || assetCost === '0' || assetCost === '' ? '' : assetCost}
                    onChange={(e) => setAssetCost(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'هامش الربح المتفق عليه (%)' : 'Agreed Profit Margin (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={marginPct === 0 || marginPct === '0' || marginPct === '' ? '' : marginPct}
                    onChange={(e) => setMarginPct(cleanNumberInput(e.target.value, 3, 100))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {language === 'ar' ? 'مدة التقسيط (بالأشهر)' : 'Installment Tenor (Months)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={tenorMonths === 0 || tenorMonths === '0' || tenorMonths === '' ? '' : tenorMonths}
                    onChange={(e) => setTenorMonths(cleanNumberInput(e.target.value, 3, 360))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0b3d2e]/90 border border-[#c8a951]/30 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <h3 className="font-amiri font-bold text-xl text-[#f3e5ab]">
                {language === 'ar' ? 'نتائج التوزيع والعوائد' : 'Contract Financial Breakdown'}
              </h3>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'finance', contractType, result: contractType === 'mudarabah' ? mudarabahResult : contractType === 'musharakah' ? musharakahResult : murabahaResult, currency })}
                className="cta-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.exportPdf}</span>
              </button>
            </div>

            {/* Mudarabah Result Cards */}
            {contractType === 'mudarabah' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/25 text-center min-w-0 overflow-hidden">
                    <span className="text-[11px] text-slate-400 block truncate">{language === 'ar' ? 'عائد رب المال' : 'Rabb al-Mal Total Payout'}</span>
                    <span
                      className="font-amiri text-xl sm:text-2xl font-bold text-[#f3e5ab] mt-1 block truncate"
                      title={`${Math.round(mudarabahResult.rabbAlMalTotalPayout).toLocaleString()} ${currency}`}
                    >
                      {Math.round(mudarabahResult.rabbAlMalTotalPayout).toLocaleString()} {currency}
                    </span>
                    <span className="text-[10px] text-emerald-300 block mt-0.5 truncate">
                      {mudarabahResult.isLoss ? 'بعد خصم الخسارة' : `ربح: +${Math.round(mudarabahResult.rabbAlMalReturn).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/25 text-center min-w-0 overflow-hidden">
                    <span className="text-[11px] text-slate-400 block truncate">{language === 'ar' ? 'عائد المضارب بالعمل' : 'Mudarib (Manager) Share'}</span>
                    <span
                      className="font-amiri text-xl sm:text-2xl font-bold text-[#f3e5ab] mt-1 block truncate"
                      title={`${Math.round(mudarabahResult.mudaribReturn).toLocaleString()} ${currency}`}
                    >
                      {Math.round(mudarabahResult.mudaribReturn).toLocaleString()} {currency}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      {mudarabahResult.isLoss ? 'خسارة الجهد فقط' : `${Math.round(mudarabahResult.mudaribProfitRatio)}% من الأرباح`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <span className="font-bold text-[#e6cb7a] block">{t.notes}:</span>
                  {(language === 'ar' ? mudarabahResult.notesAr : mudarabahResult.notesEn).map((n, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[#07261d]/60 p-2.5 rounded-lg border border-[#c8a951]/10">
                      <span className="text-[#c8a951] font-bold">•</span>
                      <p className="leading-relaxed">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Musharakah Result Cards */}
            {contractType === 'musharakah' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/25 text-center min-w-0 overflow-hidden">
                    <span className="text-[11px] text-slate-400 block truncate">{language === 'ar' ? 'عائد الطرف (أ)' : 'Party A Payout'}</span>
                    <span
                      className="font-amiri text-xl sm:text-2xl font-bold text-[#f3e5ab] mt-1 block truncate"
                      title={`${Math.round(musharakahResult.payoutA).toLocaleString()} ${currency}`}
                    >
                      {Math.round(musharakahResult.payoutA).toLocaleString()} {currency}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5 truncate">
                      {musharakahResult.isLoss ? `تحمل خسارة: ${Math.round(musharakahResult.shareA).toLocaleString()}` : `ربح: +${Math.round(musharakahResult.shareA).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#07261d] border border-[#c8a951]/25 text-center min-w-0 overflow-hidden">
                    <span className="text-[11px] text-slate-400 block truncate">{language === 'ar' ? 'عائد الطرف (ب)' : 'Party B Payout'}</span>
                    <span
                      className="font-amiri text-xl sm:text-2xl font-bold text-[#f3e5ab] mt-1 block truncate"
                      title={`${Math.round(musharakahResult.payoutB).toLocaleString()} ${currency}`}
                    >
                      {Math.round(musharakahResult.payoutB).toLocaleString()} {currency}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5 truncate">
                      {musharakahResult.isLoss ? `تحمل خسارة: ${Math.round(musharakahResult.shareB).toLocaleString()}` : `ربح: +${Math.round(musharakahResult.shareB).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <span className="font-bold text-[#e6cb7a] block">{t.notes}:</span>
                  {(language === 'ar' ? musharakahResult.notesAr : musharakahResult.notesEn).map((n, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[#07261d]/60 p-2.5 rounded-lg border border-[#c8a951]/10">
                      <span className="text-[#c8a951] font-bold">•</span>
                      <p className="leading-relaxed">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Murabaha Result Cards */}
            {contractType === 'murabaha' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'إجمالي الثمن' : 'Selling Price'}</span>
                    <span
                      className="font-amiri text-lg sm:text-xl font-bold text-[#f3e5ab] mt-0.5 block truncate"
                      title={`${Math.round(murabahaResult.totalSellingPrice).toLocaleString()} ${currency}`}
                    >
                      {Math.round(murabahaResult.totalSellingPrice).toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'مبلغ الربح المعلوم' : 'Profit Amount'}</span>
                    <span
                      className="font-amiri text-lg sm:text-xl font-bold text-emerald-300 mt-0.5 block truncate"
                      title={`${Math.round(murabahaResult.profitAmount).toLocaleString()} ${currency}`}
                    >
                      {Math.round(murabahaResult.profitAmount).toLocaleString()} {currency}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20 text-center min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-400 block truncate">{language === 'ar' ? 'القسط الشهري' : 'Monthly Payment'}</span>
                    <span
                      className="font-amiri text-lg sm:text-xl font-bold text-[#e6cb7a] mt-0.5 block truncate"
                      title={`${Math.round(murabahaResult.monthlyInstallment).toLocaleString()} ${currency}`}
                    >
                      {Math.round(murabahaResult.monthlyInstallment).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <span className="font-bold text-[#e6cb7a] block">{t.notes}:</span>
                  {(language === 'ar' ? murabahaResult.notesAr : murabahaResult.notesEn).map((n, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[#07261d]/60 p-2.5 rounded-lg border border-[#c8a951]/10">
                      <span className="text-[#c8a951] font-bold">•</span>
                      <p className="leading-relaxed">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
