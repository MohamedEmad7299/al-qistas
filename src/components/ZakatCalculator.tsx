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

export const ZakatCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [activeCategory, setActiveCategory] = useState<'mal' | 'fitr' | 'crops' | 'livestock' | 'rikaz' | 'stocks'>('mal');
  const [currency, setCurrency] = useState('EGP');
  const [goldPrice, setGoldPrice] = useState<number>(4100);
  const [silverPrice, setSilverPrice] = useState<number>(55);
  const [nisabStandard, setNisabStandard] = useState<'gold' | 'silver'>('gold');
  const [isHawlCompleted, setIsHawlCompleted] = useState<boolean>(true);
  const [useSolarCalendar, setUseSolarCalendar] = useState<boolean>(false);

  // Wealth & Cash
  const [cashOnHand, setCashOnHand] = useState<number>(50000);
  const [bankDeposits, setBankDeposits] = useState<number>(150000);
  const [gold24k, setGold24k] = useState<number>(50);
  const [gold21k, setGold21k] = useState<number>(0);
  const [gold18k, setGold18k] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [tradeGoods, setTradeGoods] = useState<number>(100000);
  const [receivables, setReceivables] = useState<number>(20000);
  const [deductibleDebts, setDeductibleDebts] = useState<number>(10000);

  // Fitr
  const [fitrMembers, setFitrMembers] = useState<number>(4);
  const [fitrPricePerSaa, setFitrPricePerSaa] = useState<number>(35);

  // Crops
  const [cropYieldKg, setCropYieldKg] = useState<number>(1000);
  const [cropIrrigation, setCropIrrigation] = useState<'natural' | 'artificial' | 'mixed'>('natural');
  const [cropPricePerKg, setCropPricePerKg] = useState<number>(1.5);

  // Livestock
  const [camels, setCamels] = useState<number>(0);
  const [cattle, setCattle] = useState<number>(0);
  const [sheep, setSheep] = useState<number>(0);

  // Rikaz
  const [rikazValue, setRikazValue] = useState<number>(0);

  // Stocks
  const [stocksTradingValue, setStocksTradingValue] = useState<number>(0);
  const [stocksInvestmentDividends, setStocksInvestmentDividends] = useState<number>(0);

  const zakatInput: ZakatInput = useMemo(() => {
    return {
      currency,
      goldPricePerGram: goldPrice,
      silverPricePerGram: silverPrice,
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
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.silverPrice} ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(Math.max(0, Number(e.target.value)))}
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
            <div className="p-3 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 flex items-center justify-between text-xs">
              <span className="text-slate-300">{language === 'ar' ? 'قيمة النصاب بالعملة الحالية:' : 'Current Nisab Value:'}</span>
              <span className="font-amiri font-bold text-base text-[#f3e5ab]">
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
                    value={cashOnHand}
                    onChange={(e) => setCashOnHand(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.bankDeposits}</label>
                  <input
                    type="number"
                    min="0"
                    value={bankDeposits}
                    onChange={(e) => setBankDeposits(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.tradeGoods}</label>
                  <input
                    type="number"
                    min="0"
                    value={tradeGoods}
                    onChange={(e) => setTradeGoods(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.receivables}</label>
                  <input
                    type="number"
                    min="0"
                    value={receivables}
                    onChange={(e) => setReceivables(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Gold by Karats */}
              <div className="p-3 rounded-xl bg-[#07261d]/70 border border-[#c8a951]/20 space-y-2">
                <span className="text-xs font-semibold text-[#e6cb7a] block">{t.zakat.goldWeights}</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold24}</label>
                    <input
                      type="number"
                      min="0"
                      value={gold24k}
                      onChange={(e) => setGold24k(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold21}</label>
                    <input
                      type="number"
                      min="0"
                      value={gold21k}
                      onChange={(e) => setGold21k(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">{t.zakat.gold18}</label>
                    <input
                      type="number"
                      min="0"
                      value={gold18k}
                      onChange={(e) => setGold18k(Math.max(0, Number(e.target.value)))}
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
                    value={deductibleDebts}
                    onChange={(e) => setDeductibleDebts(Math.max(0, Number(e.target.value)))}
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
                    value={fitrMembers}
                    onChange={(e) => setFitrMembers(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.fitrPricePerSaa} ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={fitrPricePerSaa}
                    onChange={(e) => setFitrPricePerSaa(Math.max(0, Number(e.target.value)))}
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
                      value={cropYieldKg}
                      onChange={(e) => setCropYieldKg(Math.max(0, Number(e.target.value)))}
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
                      step="0.1"
                      value={cropPricePerKg}
                      onChange={(e) => setCropPricePerKg(Math.max(0, Number(e.target.value)))}
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
                    value={camels}
                    onChange={(e) => setCamels(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">النصاب: 5 إبل</span>
                </div>

                <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20">
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.cattle}</label>
                  <input
                    type="number"
                    min="0"
                    value={cattle}
                    onChange={(e) => setCattle(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">النصاب: 30 بقرة</span>
                </div>

                <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20">
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.sheep}</label>
                  <input
                    type="number"
                    min="0"
                    value={sheep}
                    onChange={(e) => setSheep(Math.max(0, Number(e.target.value)))}
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
                  value={rikazValue}
                  onChange={(e) => setRikazValue(Math.max(0, Number(e.target.value)))}
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
                    value={stocksTradingValue}
                    onChange={(e) => setStocksTradingValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">تُزكى بالقيمة السوقية كاملة كعروض تجارة (2.5%)</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t.zakat.stocksDividends} ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={stocksInvestmentDividends}
                    onChange={(e) => setStocksInvestmentDividends(Math.max(0, Number(e.target.value)))}
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
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-slate-300">
                <span>{t.zakat.totalEligibleWealth}:</span>
                <span className="font-bold text-white">
                  {Math.round(result.totalGrossWealth).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-rose-300">
                <span>{t.zakat.totalDeductions}:</span>
                <span className="font-bold">
                  -{Math.round(result.totalDeductions).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-slate-200">
                <span>{t.zakat.netWealth}:</span>
                <span className="font-bold text-[#e6cb7a]">
                  {Math.round(result.netZakatWealth).toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-slate-300">
                <span>{t.zakat.rateApplied}:</span>
                <span className="font-bold text-white">{(result.rateApplied * 100).toFixed(3)}%</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-emerald-300 font-semibold">
                <span>{t.zakat.zakatDue} (زكاة المال):</span>
                <span className="font-bold text-sm">
                  {Math.round(result.zakatMalDue).toLocaleString()} {currency}
                </span>
              </div>

              {/* Fitr Amount if any */}
              {result.fitrDueAmount > 0 && (
                <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-[#f3e5ab]">
                  <span>{t.zakat.fitrResult} ({result.fitrTotalSaa} صاع):</span>
                  <span className="font-bold">{Math.round(result.fitrDueAmount).toLocaleString()} {currency}</span>
                </div>
              )}

              {/* Crops Amount if any */}
              {result.cropsDueKg > 0 && (
                <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-emerald-300">
                  <span>زكاة الزروع ({Math.round(result.cropsDueKg)} كجم):</span>
                  <span className="font-bold">{Math.round(result.cropsDueValue).toLocaleString()} {currency}</span>
                </div>
              )}

              {/* Rikaz if any */}
              {result.rikazDue > 0 && (
                <div className="flex justify-between py-1.5 border-b border-[#c8a951]/10 text-amber-300">
                  <span>زكاة الركاز (الخمس 20%):</span>
                  <span className="font-bold">{Math.round(result.rikazDue).toLocaleString()} {currency}</span>
                </div>
              )}
            </div>

            {/* Livestock Specific Obligations */}
            {result.livestockObligations.length > 0 && (
              <div className="p-3 rounded-xl bg-[#07261d] border border-[#c8a951]/20 space-y-2">
                <span className="text-xs font-bold text-[#e6cb7a] block">زكاة الأنعام الواجبة عيناً:</span>
                {result.livestockObligations.map((o, idx) => (
                  <div key={idx} className="text-xs text-slate-200 bg-[#051a14]/60 p-2 rounded-lg border border-[#c8a951]/10">
                    <span className="font-bold text-[#f3e5ab]">
                      {language === 'ar' ? o.obligationAr : o.obligationEn}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {language === 'ar' ? o.descriptionAr : o.descriptionEn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#c8a951]/20 to-[#07261d] border border-[#c8a951] text-center">
              <span className="text-xs text-[#e6cb7a] block uppercase font-bold tracking-wider">
                {language === 'ar' ? 'إجمالي الزكاة النقدية المستحقة' : 'Total Monetary Zakat Payable'}
              </span>
              <p className="font-amiri text-3xl font-extrabold text-[#f3e5ab] mt-1">
                {Math.round(result.grandTotalZakat).toLocaleString()} <span className="text-sm font-sans">{currency}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
