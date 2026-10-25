import React, { useState, useMemo } from 'react';
import { Language, ZakatInput, ZakatResult } from '../types';
import { translations } from '../translations/translations';
import { calculateZakat } from '../utils/zakatEngine';
import { 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Wheat, 
  HelpCircle,
  Gem,
  ChevronDown
} from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: { type: 'zakat'; result: ZakatResult; currency: string }) => void;
}

const cleanNumberInput = (val: string, maxDigits = 12): string => {
  if (!val) return '';
  const cleaned = val.replace(/^0+(?=\d)/, '');
  const parts = cleaned.split('.');
  if (parts[0].length > maxDigits) {
    parts[0] = parts[0].slice(0, maxDigits);
  }
  if (parts.length > 1) {
    return parts[0] + '.' + parts.slice(1).join('').slice(0, 2);
  }
  return parts[0];
};

export const ZakatCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [activeCategory, setActiveCategory] = useState<'mal' | 'fitr' | 'crops' | 'livestock' | 'rikaz' | 'stocks'>('mal');
  const [currency, setCurrency] = useState('EGP');
  const [goldPrice, setGoldPrice] = useState<number | string>(4100);
  const [silverPrice, setSilverPrice] = useState<number | string>(55);
  const [nisabStandard, setNisabStandard] = useState<'gold' | 'silver'>('gold');
  const [isHawlCompleted, setIsHawlCompleted] = useState<boolean>(true);
  const [useSolarCalendar, setUseSolarCalendar] = useState<boolean>(false);

  // Wealth & Cash - default blank
  const [cashOnHand, setCashOnHand] = useState<number | string>('');
  const [bankDeposits, setBankDeposits] = useState<number | string>('');
  const [gold24k, setGold24k] = useState<number | string>('');
  const [gold21k, setGold21k] = useState<number | string>('');
  const [gold18k, setGold18k] = useState<number | string>('');
  const [silverGrams, setSilverGrams] = useState<number | string>('');
  const [tradeGoods, setTradeGoods] = useState<number | string>('');
  const [receivables, setReceivables] = useState<number | string>('');
  const [deductibleDebts, setDeductibleDebts] = useState<number | string>('');

  // Fitr
  const [fitrMembers, setFitrMembers] = useState<number | string>('');
  const [fitrPricePerSaa, setFitrPricePerSaa] = useState<number | string>('');

  // Crops
  const [cropYieldKg, setCropYieldKg] = useState<number | string>('');
  const [cropIrrigation, setCropIrrigation] = useState<'natural' | 'artificial' | 'mixed'>('natural');
  const [cropPricePerKg, setCropPricePerKg] = useState<number | string>('');

  // Livestock
  const [camels, setCamels] = useState<number | string>('');
  const [cattle, setCattle] = useState<number | string>('');
  const [sheep, setSheep] = useState<number | string>('');

  // Rikaz
  const [rikazValue, setRikazValue] = useState<number | string>('');

  // Stocks
  const [stocksTradingValue, setStocksTradingValue] = useState<number | string>('');
  const [stocksInvestmentDividends, setStocksInvestmentDividends] = useState<number | string>('');

  const zakatInput: ZakatInput = useMemo(() => {
    return {
      currency,
      goldPricePerGram: Number(goldPrice) || 0,
      silverPricePerGram: Number(silverPrice) || 0,
      nisabStandard,
      cashOnHand: Number(cashOnHand) || 0,
      bankDeposits: Number(bankDeposits) || 0,
      gold24k: Number(gold24k) || 0,
      gold21k: Number(gold21k) || 0,
      gold18k: Number(gold18k) || 0,
      silverGrams: Number(silverGrams) || 0,
      tradeGoods: Number(tradeGoods) || 0,
      receivables: Number(receivables) || 0,
      deductibleDebts: Number(deductibleDebts) || 0,
      isHawlCompleted,
      useSolarCalendar,
      fitrMembers: Number(fitrMembers) || 0,
      fitrPricePerSaa: Number(fitrPricePerSaa) || 0,
      cropYieldKg: Number(cropYieldKg) || 0,
      cropIrrigation,
      cropPricePerKg: Number(cropPricePerKg) || 0,
      camels: Number(camels) || 0,
      cattle: Number(cattle) || 0,
      sheep: Number(sheep) || 0,
      rikazValue: Number(rikazValue) || 0,
      stocksTradingValue: Number(stocksTradingValue) || 0,
      stocksInvestmentDividends: Number(stocksInvestmentDividends) || 0,
    };
  }, [
    currency,
    goldPrice,
    silverPrice,
    nisabStandard,
    cashOnHand,
    bankDeposits,
    gold24k,
    gold21k,
    gold18k,
    silverGrams,
    tradeGoods,
    receivables,
    deductibleDebts,
    isHawlCompleted,
    useSolarCalendar,
    fitrMembers,
    fitrPricePerSaa,
    cropYieldKg,
    cropIrrigation,
    cropPricePerKg,
    camels,
    cattle,
    sheep,
    rikazValue,
    stocksTradingValue,
    stocksInvestmentDividends,
  ]);

  const result = useMemo(() => {
    return calculateZakat(zakatInput);
  }, [zakatInput]);

  const currencies = ['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP', 'KWD', 'QAR', 'MAD', 'TRY', 'IDR'];

  return (
    <div className="space-y-8">
      {/* Title & Currency Bar */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'الركن الثالث من أركان الإسلام' : 'Third Pillar of Islam'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.zakat.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
              {t.zakat.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#e6cb7a]">{t.currency}:</span>
            <div className="relative inline-flex items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-[#07261d] border border-[#c8a951]/40 text-[#f3e5ab] text-xs font-bold rounded-lg ps-8 pe-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#c8a951] cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#c8a951] absolute start-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap border-b border-[#c8a951]/20 gap-2 pb-2">
        {[
          { id: 'mal', label: t.zakat.tabs.mal, icon: Coins },
          { id: 'fitr', label: t.zakat.tabs.fitr, icon: Gem },
          { id: 'crops', label: t.zakat.tabs.crops, icon: Wheat },
          { id: 'livestock', label: t.zakat.tabs.livestock, icon: HelpCircle },
          { id: 'rikaz', label: t.zakat.tabs.rikaz, icon: Sparkles },
          { id: 'stocks', label: t.zakat.tabs.stocks, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] shadow-md'
                  : 'bg-[#0b3d2e]/60 text-slate-300 hover:text-white border border-[#c8a951]/15 hover:border-[#c8a951]/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Nisab Benchmark Settings */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] flex items-center justify-between border-b border-[#c8a951]/20 pb-2">
              <span>{t.zakat.nisabSettings}</span>
              <span className="text-xs text-[#e6cb7a] font-normal">
                {nisabStandard === 'gold' ? t.zakat.goldNisabRule : t.zakat.silverNisabRule}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.goldPrice} ({currency})</label>
                <input
                  type="number"
                  min="0"
                  max="999999"
                  value={goldPrice === '' ? '' : goldPrice}
                  onChange={(e) => setGoldPrice(cleanNumberInput(e.target.value, 7))}
                  placeholder="4100"
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.silverPrice} ({currency})</label>
                <input
                  type="number"
                  min="0"
                  max="999999"
                  step="0.1"
                  value={silverPrice === '' ? '' : silverPrice}
                  onChange={(e) => setSilverPrice(cleanNumberInput(e.target.value, 7))}
                  placeholder="55"
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  {language === 'ar' ? 'معيار النصاب' : 'Nisab Standard'}
                </label>
                <select
                  value={nisabStandard}
                  onChange={(e) => setNisabStandard(e.target.value as any)}
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-2 py-1.5 text-white font-bold text-xs"
                >
                  <option value="gold">{language === 'ar' ? 'نصاب الذهب (85 جم)' : 'Gold (85g)'}</option>
                  <option value="silver">{language === 'ar' ? 'نصاب الفضة (595 جم)' : 'Silver (595g)'}</option>
                </select>
              </div>
            </div>

            {/* Nisab Value readout */}
            <div className="p-3 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 flex items-center justify-between text-xs min-w-0 overflow-hidden">
              <span className="text-slate-300 shrink-0">{language === 'ar' ? 'قيمة النصاب بالعملة الحالية:' : 'Current Nisab Value:'}</span>
              <span className="font-amiri font-bold text-base text-[#f3e5ab] truncate" title={`${Math.round(result.nisabThreshold).toLocaleString()} ${currency}`}>
                {Math.round(result.nisabThreshold).toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Tab 1: Wealth & Gold Inputs */}
          {activeCategory === 'mal' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.tabs.mal}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.cashOnHand}</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={cashOnHand === 0 || cashOnHand === '0' || cashOnHand === '' ? '' : cashOnHand}
                    onChange={(e) => setCashOnHand(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.bankDeposits}</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={bankDeposits === 0 || bankDeposits === '0' || bankDeposits === '' ? '' : bankDeposits}
                    onChange={(e) => setBankDeposits(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.tradeGoods}</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={tradeGoods === 0 || tradeGoods === '0' || tradeGoods === '' ? '' : tradeGoods}
                    onChange={(e) => setTradeGoods(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.receivables}</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={receivables === 0 || receivables === '0' || receivables === '' ? '' : receivables}
                    onChange={(e) => setReceivables(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Gold & Silver by Karats / Weight */}
              <div className="p-3 rounded-xl bg-[#07261d]/70 border border-[#c8a951]/20 space-y-2">
                <span className="text-xs font-semibold text-[#e6cb7a] block">{t.zakat.goldWeights}</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold24}</label>
                    <input
                      type="number"
                      min="0"
                      max="999999"
                      value={gold24k === 0 || gold24k === '0' || gold24k === '' ? '' : gold24k}
                      onChange={(e) => setGold24k(cleanNumberInput(e.target.value, 7))}
                      placeholder="0"
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold21}</label>
                    <input
                      type="number"
                      min="0"
                      max="999999"
                      value={gold21k === 0 || gold21k === '0' || gold21k === '' ? '' : gold21k}
                      onChange={(e) => setGold21k(cleanNumberInput(e.target.value, 7))}
                      placeholder="0"
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold18}</label>
                    <input
                      type="number"
                      min="0"
                      max="999999"
                      value={gold18k === 0 || gold18k === '0' || gold18k === '' ? '' : gold18k}
                      onChange={(e) => setGold18k(cleanNumberInput(e.target.value, 7))}
                      placeholder="0"
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{language === 'ar' ? 'فضة (جرام)' : 'Silver (g)'}</label>
                    <input
                      type="number"
                      min="0"
                      max="999999"
                      value={silverGrams === 0 || silverGrams === '0' || silverGrams === '' ? '' : silverGrams}
                      onChange={(e) => setSilverGrams(cleanNumberInput(e.target.value, 7))}
                      placeholder="0"
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions & Hawl */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-rose-300 mb-1 font-semibold">{t.zakat.deductibleDebts}</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={deductibleDebts === 0 || deductibleDebts === '0' || deductibleDebts === '' ? '' : deductibleDebts}
                    onChange={(e) => setDeductibleDebts(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-rose-500/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2 sm:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={isHawlCompleted}
                      onChange={(e) => setIsHawlCompleted(e.target.checked)}
                      className="w-4 h-4 accent-[#c8a951]"
                    />
                    <span>{t.zakat.hawlCheck}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={useSolarCalendar}
                      onChange={(e) => setUseSolarCalendar(e.target.checked)}
                      className="w-4 h-4 accent-[#c8a951]"
                    />
                    <span>{t.zakat.useSolar}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Fitr */}
          {activeCategory === 'fitr' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.tabs.fitr}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.fitrPersons}</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={fitrMembers === 0 || fitrMembers === '0' || fitrMembers === '' ? '' : fitrMembers}
                    onChange={(e) => setFitrMembers(cleanNumberInput(e.target.value, 3))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.fitrPricePerSaa} ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    step="0.5"
                    value={fitrPricePerSaa === 0 || fitrPricePerSaa === '0' || fitrPricePerSaa === '' ? '' : fitrPricePerSaa}
                    onChange={(e) => setFitrPricePerSaa(cleanNumberInput(e.target.value, 5))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 text-xs text-slate-300 leading-relaxed font-amiri">
                {language === 'ar'
                  ? 'فرض رسول الله ﷺ زكاة الفطر صاعاً من تمر أو صاعاً من شعير على العبد والحر والذكر والأنثى والصغير والكبير من المسلمين. والصاع النبوي يعادل حوالي 2.5 كيلوجرام من غالب قوت البلد (كالأرز أو القمح).'
                  : 'The Prophet ﷺ ordained Zakat al-Fitr as one Saa\' (~2.5 kg of staple grains like rice or wheat) on every Muslim before Eid prayer.'}
              </div>
            </div>
          )}

          {/* Tab 3: Crops */}
          {activeCategory === 'crops' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.tabs.crops}
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">{t.zakat.cropsYield}</label>
                    <input
                      type="number"
                      min="0"
                      max="99999999"
                      value={cropYieldKg === 0 || cropYieldKg === '0' || cropYieldKg === '' ? '' : cropYieldKg}
                      onChange={(e) => setCropYieldKg(cleanNumberInput(e.target.value, 8))}
                      placeholder="0"
                      className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      {language === 'ar' ? 'سعر الكيلو التقديري' : 'Price per kg'} ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99999"
                      step="0.1"
                      value={cropPricePerKg === 0 || cropPricePerKg === '0' || cropPricePerKg === '' ? '' : cropPricePerKg}
                      onChange={(e) => setCropPricePerKg(cleanNumberInput(e.target.value, 5))}
                      placeholder="0"
                      className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.irrigationType}</label>
                  <select
                    value={cropIrrigation}
                    onChange={(e) => setCropIrrigation(e.target.value as any)}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  >
                    <option value="natural">{t.zakat.rainIrrigated}</option>
                    <option value="artificial">{t.zakat.artificialIrrigated}</option>
                    <option value="mixed">{t.zakat.mixedIrrigated}</option>
                  </select>
                </div>

                <div className="text-[11px] text-[#e6cb7a] bg-[#07261d]/80 p-2.5 rounded-xl border border-[#c8a951]/20">
                  {t.zakat.cropsNisabNotice}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Livestock */}
          {activeCategory === 'livestock' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.livestockTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20">
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.camels}</label>
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    value={camels === 0 || camels === '0' || camels === '' ? '' : camels}
                    onChange={(e) => setCamels(cleanNumberInput(e.target.value, 5))}
                    placeholder="0"
                    className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">النصاب: 5 إبل</span>
                </div>

                <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20">
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.cattle}</label>
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    value={cattle === 0 || cattle === '0' || cattle === '' ? '' : cattle}
                    onChange={(e) => setCattle(cleanNumberInput(e.target.value, 5))}
                    placeholder="0"
                    className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">النصاب: 30 بقرة</span>
                </div>

                <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20">
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.sheep}</label>
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    value={sheep === 0 || sheep === '0' || sheep === '' ? '' : sheep}
                    onChange={(e) => setSheep(cleanNumberInput(e.target.value, 5))}
                    placeholder="0"
                    className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">النصاب: 40 شاة</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Rikaz & Minerals */}
          {activeCategory === 'rikaz' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.tabs.rikaz}
              </h3>

              <div>
                <label className="block text-xs text-slate-300 mb-1">{t.zakat.rikazValue} ({currency})</label>
                <input
                  type="number"
                  min="0"
                  max="999999999999"
                  value={rikazValue === 0 || rikazValue === '0' || rikazValue === '' ? '' : rikazValue}
                  onChange={(e) => setRikazValue(cleanNumberInput(e.target.value, 12))}
                  placeholder="0"
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div className="text-xs text-[#e6cb7a] bg-[#07261d]/80 p-3 rounded-xl border border-[#c8a951]/20 leading-relaxed font-amiri">
                {t.zakat.rikazNotice}
              </div>
            </div>
          )}

          {/* Tab 6: Stocks */}
          {activeCategory === 'stocks' && (
            <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] border-b border-[#c8a951]/20 pb-2">
                {t.zakat.tabs.stocks}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.stocksTrading} ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={stocksTradingValue === 0 || stocksTradingValue === '0' || stocksTradingValue === '' ? '' : stocksTradingValue}
                    onChange={(e) => setStocksTradingValue(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">تُزكى بالقيمة السوقية كاملة كعروض تجارة (2.5%)</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.stocksDividends} ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={stocksInvestmentDividends === 0 || stocksInvestmentDividends === '0' || stocksInvestmentDividends === '' ? '' : stocksInvestmentDividends}
                    onChange={(e) => setStocksInvestmentDividends(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">تُزكى بنسبة 10% على صافي الأرباح الموزعة وفق قرار مجمع الفقه الإسلامي</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Results & Grand Total (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Result Card */}
          <div className="bg-[#0b3d2e]/90 border border-[#c8a951]/40 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#c8a951]/25 pb-3">
              <span className="font-amiri font-bold text-lg text-[#f3e5ab]">
                {language === 'ar' ? 'ملخص وعاء الزكاة' : 'Zakat Obligation Summary'}
              </span>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'zakat', result, currency })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.exportPdf}</span>
              </button>
            </div>

            {/* Nisab Status Badge */}
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                result.isEligibleForZakat
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {result.isEligibleForZakat ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <span>{result.isEligibleForZakat ? t.zakat.nisabStatusEligible : t.zakat.nisabStatusNotEligible}</span>
            </div>

            {/* Key Figures */}
            <div className="space-y-2.5 text-xs min-w-0">
              <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-slate-300 gap-2 min-w-0">
                <span className="shrink-0">{t.zakat.totalEligibleWealth}:</span>
                <span className="font-bold text-white truncate text-right" title={`${Math.round(result.totalGrossWealth).toLocaleString()} ${currency}`}>
                  {Math.round(result.totalGrossWealth).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-rose-300 gap-2 min-w-0">
                <span className="shrink-0">{t.zakat.totalDeductions}:</span>
                <span className="font-bold truncate text-right" title={`-${Math.round(result.totalDeductions).toLocaleString()} ${currency}`}>
                  -{Math.round(result.totalDeductions).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-slate-200 gap-2 min-w-0">
                <span className="shrink-0">{t.zakat.netWealth}:</span>
                <span className="font-bold text-[#e6cb7a] truncate text-right" title={`${Math.round(result.netZakatWealth).toLocaleString()} ${currency}`}>
                  {Math.round(result.netZakatWealth).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-slate-300 gap-2 min-w-0">
                <span className="shrink-0">{t.zakat.rateApplied}:</span>
                <span className="font-bold text-white truncate text-right">{(result.rateApplied * 100).toFixed(3)}%</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-emerald-300 font-semibold gap-2 min-w-0">
                <span className="shrink-0">{t.zakat.zakatDue} (زكاة المال):</span>
                <span className="font-bold text-sm truncate text-right" title={`${Math.round(result.zakatMalDue).toLocaleString()} ${currency}`}>
                  {Math.round(result.zakatMalDue).toLocaleString()} {currency}
                </span>
              </div>

              {/* Fitr Amount if any */}
              {result.fitrDueAmount > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-[#f3e5ab] gap-2 min-w-0">
                  <span className="shrink-0">{t.zakat.fitrResult} ({result.fitrTotalSaa} صاع):</span>
                  <span className="font-bold truncate text-right" title={`${Math.round(result.fitrDueAmount).toLocaleString()} ${currency}`}>
                    {Math.round(result.fitrDueAmount).toLocaleString()} {currency}
                  </span>
                </div>
              )}

              {/* Crops Amount if any */}
              {result.cropsDueKg > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-emerald-300 gap-2 min-w-0">
                  <span className="shrink-0">زكاة الزروع ({Math.round(result.cropsDueKg)} كجم):</span>
                  <span className="font-bold truncate text-right" title={`${Math.round(result.cropsDueValue).toLocaleString()} ${currency}`}>
                    {Math.round(result.cropsDueValue).toLocaleString()} {currency}
                  </span>
                </div>
              )}

              {/* Rikaz if any */}
              {result.rikazDue > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-[#c8a951]/10 text-amber-300 gap-2 min-w-0">
                  <span className="shrink-0">زكاة الركاز (الخمس 20%):</span>
                  <span className="font-bold truncate text-right" title={`${Math.round(result.rikazDue).toLocaleString()} ${currency}`}>
                    {Math.round(result.rikazDue).toLocaleString()} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* Livestock Specific Obligations */}
            {result.livestockObligations.length > 0 && (
              <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20 space-y-2 min-w-0 overflow-hidden">
                <span className="text-xs font-bold text-[#e6cb7a] block">زكاة الأنعام الواجبة عيناً:</span>
                {result.livestockObligations.map((o, idx) => (
                  <div key={idx} className="text-xs text-slate-200 bg-[#051a14]/60 p-2 rounded-lg border border-[#c8a951]/10 min-w-0">
                    <span className="font-bold text-[#f3e5ab] block truncate">
                      {language === 'ar' ? o.obligationAr : o.obligationEn}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                      {language === 'ar' ? o.descriptionAr : o.descriptionEn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#c8a951]/20 to-[#07261d] border border-[#c8a951] text-center min-w-0 overflow-hidden">
              <span className="text-xs text-[#e6cb7a] block uppercase font-bold tracking-wider">
                {language === 'ar' ? 'إجمالي الزكاة النقدية المستحقة' : 'Total Monetary Zakat Payable'}
              </span>
              <p
                className="font-amiri text-2xl sm:text-3xl font-extrabold text-[#f3e5ab] mt-1 truncate"
                title={`${Math.round(result.grandTotalZakat).toLocaleString()} ${currency}`}
              >
                {Math.round(result.grandTotalZakat).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
