import React, { useState, useMemo, useEffect } from 'react';
import { Language, InheritanceInput, InheritanceResult } from '../types';
import { translations } from '../translations/translations';
import { calculateInheritance } from '../utils/inheritanceEngine';
import { 
  Users, 
  Coins, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

interface Props {
  language: Language;
  onOpenPdfModal: (data: { type: 'inheritance'; result: InheritanceResult; currency: string }) => void;
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

export const InheritanceCalculator: React.FC<Props> = ({ language, onOpenPdfModal }) => {
  const t = translations[language];

  const [currency, setCurrency] = useState('EGP');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [estateValue, setEstateValue] = useState<number | string>('');
  const [debts, setDebts] = useState<number | string>('');
  const [funeralExpenses, setFuneralExpenses] = useState<number | string>('');
  const [wasiyyah, setWasiyyah] = useState<number | string>('');

  // Heirs state - default to 0 / false so fields start clean and blank
  const [wives, setWives] = useState<number>(0);
  const [husband, setHusband] = useState<boolean>(false);
  const [sons, setSons] = useState<number | string>('');
  const [daughters, setDaughters] = useState<number | string>('');
  const [grandsons, setGrandsons] = useState<number | string>('');
  const [granddaughters, setGranddaughters] = useState<number | string>('');
  const [father, setFather] = useState<boolean>(false);
  const [mother, setMother] = useState<boolean>(false);
  const [paternalGrandfather, setPaternalGrandfather] = useState<boolean>(false);
  const [paternalGrandmother, setPaternalGrandmother] = useState<boolean>(false);
  const [maternalGrandmother, setMaternalGrandmother] = useState<boolean>(false);
  const [fullBrothers, setFullBrothers] = useState<number | string>('');
  const [fullSisters, setFullSisters] = useState<number | string>('');
  const [paternalBrothers, setPaternalBrothers] = useState<number | string>('');
  const [paternalSisters, setPaternalSisters] = useState<number | string>('');
  const [maternalBrothers, setMaternalBrothers] = useState<number | string>('');
  const [maternalSisters, setMaternalSisters] = useState<number | string>('');
  const [nephewsFull, setNephewsFull] = useState<number | string>('');
  const [unclesFull, setUnclesFull] = useState<number | string>('');
  const [cousinsFull, setCousinsFull] = useState<number | string>('');

  // Maximum legal wasiyyah (1/3 of net estate after debts and funeral expenses)
  const maxWasiyyah = useMemo(() => {
    const net = (Number(estateValue) || 0) - (Number(debts) || 0) - (Number(funeralExpenses) || 0);
    return Math.floor(Math.max(0, net) / 3);
  }, [estateValue, debts, funeralExpenses]);

  // Keep wasiyyah clamped if estate or debts change
  useEffect(() => {
    if (wasiyyah !== '' && Number(wasiyyah) > maxWasiyyah) {
      setWasiyyah(maxWasiyyah > 0 ? maxWasiyyah : '');
    }
  }, [maxWasiyyah]);

  const [activeTabSection, setActiveTabSection] = useState<'descendants' | 'ascendants' | 'siblings' | 'extended'>('descendants');

  const inheritanceInput: InheritanceInput = useMemo(() => {
    return {
      deceasedGender,
      estateValue: Number(estateValue) || 0,
      debts: Number(debts) || 0,
      funeralExpenses: Number(funeralExpenses) || 0,
      wasiyyah: Number(wasiyyah) || 0,
      heirs: {
        husband: deceasedGender === 'female' ? husband : false,
        wives: deceasedGender === 'male' ? wives : 0,
        sons: Number(sons) || 0,
        daughters: Number(daughters) || 0,
        grandsons: Number(grandsons) || 0,
        granddaughters: Number(granddaughters) || 0,
        father,
        mother,
        paternalGrandfather,
        paternalGrandmother,
        maternalGrandmother,
        fullBrothers: Number(fullBrothers) || 0,
        fullSisters: Number(fullSisters) || 0,
        paternalBrothers: Number(paternalBrothers) || 0,
        paternalSisters: Number(paternalSisters) || 0,
        maternalBrothers: Number(maternalBrothers) || 0,
        maternalSisters: Number(maternalSisters) || 0,
        nephewsFull: Number(nephewsFull) || 0,
        unclesFull: Number(unclesFull) || 0,
        cousinsFull: Number(cousinsFull) || 0,
      },
    };
  }, [
    deceasedGender,
    estateValue,
    debts,
    funeralExpenses,
    wasiyyah,
    wives,
    husband,
    sons,
    daughters,
    grandsons,
    granddaughters,
    father,
    mother,
    paternalGrandfather,
    paternalGrandmother,
    maternalGrandmother,
    fullBrothers,
    fullSisters,
    paternalBrothers,
    paternalSisters,
    maternalBrothers,
    maternalSisters,
    nephewsFull,
    unclesFull,
    cousinsFull,
  ]);

  const result = useMemo(() => {
    return calculateInheritance(inheritanceInput);
  }, [inheritanceInput]);

  const currencies = ['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP', 'KWD', 'QAR', 'MAD', 'TRY', 'IDR'];

  return (
    <div className="space-y-8">
      {/* Title & Description Card */}
      <div className="emerald-card rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8a951]/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#e6cb7a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#c8a951]" />
              <span>{language === 'ar' ? 'علم الفرائض والميراث' : 'Ilm al-Fara\'id'}</span>
            </div>
            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-[#f3e5ab] mt-1">
              {t.inheritance.title}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
              {t.inheritance.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
        {/* Left / Input Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Deceased Info & Financials */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] flex items-center gap-2 border-b border-[#c8a951]/20 pb-2">
              <Coins className="w-5 h-5 text-[#c8a951]" />
              <span>{t.inheritance.deceasedInfo}</span>
            </h3>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {t.inheritance.deceasedGender}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setDeceasedGender('male')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                    deceasedGender === 'male'
                      ? 'bg-gradient-to-r from-[#e6cb7a] to-[#c8a951] text-[#07261d] border-[#c8a951] shadow-md ring-2 ring-[#c8a951]/40 scale-[1.02]'
                      : 'bg-[#07261d] text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951]/60 hover:text-white'
                  }`}
                >
                  <span>♂ {t.inheritance.male}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeceasedGender('female')}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                    deceasedGender === 'female'
                      ? 'bg-gradient-to-r from-[#e6cb7a] to-[#c8a951] text-[#07261d] border-[#c8a951] shadow-md ring-2 ring-[#c8a951]/40 scale-[1.02]'
                      : 'bg-[#07261d] text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951]/60 hover:text-white'
                  }`}
                >
                  <span>♀ {t.inheritance.female}</span>
                </button>
              </div>
            </div>

            {/* Estate Values */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t.inheritance.estateValue} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  max="999999999999"
                  value={estateValue === 0 || estateValue === '0' || estateValue === '' ? '' : estateValue}
                  onChange={(e) => setEstateValue(cleanNumberInput(e.target.value, 12))}
                  placeholder="0"
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#c8a951] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    {t.inheritance.debts}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={debts === 0 || debts === '0' || debts === '' ? '' : debts}
                    onChange={(e) => setDebts(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#c8a951]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    {t.inheritance.funeralExpenses}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999999999999"
                    value={funeralExpenses === 0 || funeralExpenses === '0' || funeralExpenses === '' ? '' : funeralExpenses}
                    onChange={(e) => setFuneralExpenses(cleanNumberInput(e.target.value, 12))}
                    placeholder="0"
                    className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#c8a951]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-300">
                    {t.inheritance.wasiyyah} (Max 1/3)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (maxWasiyyah > 0) setWasiyyah(maxWasiyyah);
                    }}
                    disabled={maxWasiyyah <= 0}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c8a951]/15 hover:bg-[#c8a951]/30 border border-[#c8a951]/40 text-[#f3e5ab] text-[10px] font-bold hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs disabled:opacity-50 disabled:no-underline disabled:cursor-default"
                    title={language === 'ar' ? 'انقر لتطبيق الحد الأقصى' : 'Click to apply max'}
                  >
                    <span>⚡ Max: {maxWasiyyah.toLocaleString()} {currency}</span>
                    {Number(wasiyyah) >= maxWasiyyah && maxWasiyyah > 0 && (
                      <span className="text-amber-400 ms-1 font-extrabold">({language === 'ar' ? 'الحد الأقصى' : 'Max'})</span>
                    )}
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  max={maxWasiyyah > 0 ? maxWasiyyah : undefined}
                  disabled={Number(estateValue) <= 0}
                  value={wasiyyah === 0 || wasiyyah === '0' || wasiyyah === '' ? '' : wasiyyah}
                  onChange={(e) => setWasiyyah(cleanNumberInput(e.target.value, 12, maxWasiyyah))}
                  placeholder={Number(estateValue) <= 0 ? (language === 'ar' ? 'أدخل التركة أولاً' : 'Enter estate first') : '0'}
                  className="w-full bg-[#07261d] border border-[#c8a951]/30 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#c8a951] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. Heirs Selector with Categories */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-2">
              <h3 className="font-amiri font-bold text-lg text-[#f3e5ab] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c8a951]" />
                <span>{t.inheritance.selectHeirs}</span>
              </h3>
            </div>

            {/* Spouse Section */}
            <div className="p-3 rounded-xl bg-[#07261d]/80 border border-[#c8a951]/20">
              <span className="text-xs font-semibold text-[#e6cb7a] block mb-2">
                {t.inheritance.spouses}
              </span>
              {deceasedGender === 'male' ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-medium text-slate-300">{t.inheritance.wives}:</span>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {[0, 1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setWives(count)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                          wives === count
                            ? 'bg-gradient-to-r from-[#e6cb7a] to-[#c8a951] text-[#07261d] border-[#c8a951] shadow-md scale-110 ring-2 ring-[#c8a951]/40'
                            : 'bg-[#0b3d2e] text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951] hover:text-white hover:bg-[#114d3a]'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-xl hover:bg-[#0b3d2e]/40 transition">
                  <span className="text-xs sm:text-sm text-slate-300">{t.inheritance.husband}</span>
                  <input
                    type="checkbox"
                    checked={husband}
                    onChange={(e) => setHusband(e.target.checked)}
                    className="w-5 h-5 accent-[#c8a951] rounded cursor-pointer"
                  />
                </label>
              )}
            </div>

            {/* Heirs Category Tabs - Spacious & Comfortable */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 border-b border-[#c8a951]/20 pb-3">
              {[
                { id: 'descendants', label: language === 'ar' ? 'الفروع (الأولاد)' : 'Descendants' },
                { id: 'ascendants', label: language === 'ar' ? 'الأصول (الآباء)' : 'Ascendants' },
                { id: 'siblings', label: language === 'ar' ? 'الإخوة والأخوات' : 'Siblings' },
                { id: 'extended', label: language === 'ar' ? 'باقي العصبات' : 'Agnates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabSection(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                    activeTabSection === tab.id
                      ? 'bg-gradient-to-r from-[#e6cb7a] via-[#c8a951] to-[#b39238] text-[#07261d] border-transparent shadow-md scale-105'
                      : 'bg-[#07261d]/85 text-slate-300 border-[#c8a951]/25 hover:border-[#c8a951]/60 hover:text-white hover:bg-[#0b3d2e] hover:-translate-y-0.5'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Category Content */}
            <div className="space-y-3 pt-1">
              {/* Descendants */}
              {activeTabSection === 'descendants' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-xs text-slate-300 mb-1">{t.inheritance.sons}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={sons === 0 || sons === '0' || sons === '' ? '' : sons}
                        onChange={(e) => setSons(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2.5 py-1 text-center font-bold text-white text-sm"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-xs text-slate-300 mb-1">{t.inheritance.daughters}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={daughters === 0 || daughters === '0' || daughters === '' ? '' : daughters}
                        onChange={(e) => setDaughters(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2.5 py-1 text-center font-bold text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.grandsons}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={grandsons === 0 || grandsons === '0' || grandsons === '' ? '' : grandsons}
                        onChange={(e) => setGrandsons(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2.5 py-1 text-center font-bold text-white text-sm"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.granddaughters}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={granddaughters === 0 || granddaughters === '0' || granddaughters === '' ? '' : granddaughters}
                        onChange={(e) => setGranddaughters(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2.5 py-1 text-center font-bold text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ascendants */}
              {activeTabSection === 'ascendants' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15 cursor-pointer">
                    <span className="text-xs text-slate-200">{t.inheritance.father}</span>
                    <input
                      type="checkbox"
                      checked={father}
                      onChange={(e) => setFather(e.target.checked)}
                      className="w-4 h-4 accent-[#c8a951]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15 cursor-pointer">
                    <span className="text-xs text-slate-200">{t.inheritance.mother}</span>
                    <input
                      type="checkbox"
                      checked={mother}
                      onChange={(e) => setMother(e.target.checked)}
                      className="w-4 h-4 accent-[#c8a951]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#07261d] border border-[#c8a951]/15 cursor-pointer">
                    <span className="text-xs text-slate-200">{t.inheritance.paternalGrandfather}</span>
                    <input
                      type="checkbox"
                      checked={paternalGrandfather}
                      onChange={(e) => setPaternalGrandfather(e.target.checked)}
                      className="w-4 h-4 accent-[#c8a951]"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15 cursor-pointer">
                      <span className="text-[11px] text-slate-300">{t.inheritance.paternalGrandmother}</span>
                      <input
                        type="checkbox"
                        checked={paternalGrandmother}
                        onChange={(e) => setPaternalGrandmother(e.target.checked)}
                        className="w-4 h-4 accent-[#c8a951]"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15 cursor-pointer">
                      <span className="text-[11px] text-slate-300">{t.inheritance.maternalGrandmother}</span>
                      <input
                        type="checkbox"
                        checked={maternalGrandmother}
                        onChange={(e) => setMaternalGrandmother(e.target.checked)}
                        className="w-4 h-4 accent-[#c8a951]"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Siblings */}
              {activeTabSection === 'siblings' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.fullBrothers}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={fullBrothers === 0 || fullBrothers === '0' || fullBrothers === '' ? '' : fullBrothers}
                        onChange={(e) => setFullBrothers(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.fullSisters}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={fullSisters === 0 || fullSisters === '0' || fullSisters === '' ? '' : fullSisters}
                        onChange={(e) => setFullSisters(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.paternalBrothers}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={paternalBrothers === 0 || paternalBrothers === '0' || paternalBrothers === '' ? '' : paternalBrothers}
                        onChange={(e) => setPaternalBrothers(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.paternalSisters}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={paternalSisters === 0 || paternalSisters === '0' || paternalSisters === '' ? '' : paternalSisters}
                        onChange={(e) => setPaternalSisters(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.maternalBrothers}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={maternalBrothers === 0 || maternalBrothers === '0' || maternalBrothers === '' ? '' : maternalBrothers}
                        onChange={(e) => setMaternalBrothers(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15">
                      <label className="block text-[11px] text-slate-300 mb-1">{t.inheritance.maternalSisters}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={maternalSisters === 0 || maternalSisters === '0' || maternalSisters === '' ? '' : maternalSisters}
                        onChange={(e) => setMaternalSisters(cleanNumberInput(e.target.value, 2, 50))}
                        placeholder="0"
                        className="w-full bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Extended Agnates */}
              {activeTabSection === 'extended' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15 flex items-center justify-between">
                    <label className="text-xs text-slate-300">{t.inheritance.nephewsFull}</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={nephewsFull === 0 || nephewsFull === '0' || nephewsFull === '' ? '' : nephewsFull}
                      onChange={(e) => setNephewsFull(cleanNumberInput(e.target.value, 2, 50))}
                      placeholder="0"
                      className="w-16 bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>

                  <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15 flex items-center justify-between">
                    <label className="text-xs text-slate-300">{t.inheritance.unclesFull}</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={unclesFull === 0 || unclesFull === '0' || unclesFull === '' ? '' : unclesFull}
                      onChange={(e) => setUnclesFull(cleanNumberInput(e.target.value, 2, 50))}
                      placeholder="0"
                      className="w-16 bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>

                  <div className="p-2 rounded-xl bg-[#07261d] border border-[#c8a951]/15 flex items-center justify-between">
                    <label className="text-xs text-slate-300">{t.inheritance.cousinsFull}</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={cousinsFull === 0 || cousinsFull === '0' || cousinsFull === '' ? '' : cousinsFull}
                      onChange={(e) => setCousinsFull(cleanNumberInput(e.target.value, 2, 50))}
                      placeholder="0"
                      className="w-16 bg-[#0b3d2e] rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right / Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b3d2e] to-[#07261d] border border-[#c8a951]/30 min-w-0 overflow-hidden">
              <span className="text-[11px] text-[#e6cb7a] block">{t.inheritance.netEstate}</span>
              <p
                className="font-amiri text-xl sm:text-2xl font-bold text-white mt-1 truncate"
                title={`${Math.round(result.netEstate).toLocaleString()} ${currency}`}
              >
                {Math.round(result.netEstate).toLocaleString()} <span className="text-xs text-[#c8a951]">{currency}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b3d2e] to-[#07261d] border border-[#c8a951]/30 min-w-0 overflow-hidden">
              <span className="text-[11px] text-[#e6cb7a] block">{t.inheritance.baseDenominator}</span>
              <div className="flex items-baseline gap-2 mt-1 truncate">
                <span className="font-amiri text-xl sm:text-2xl font-bold text-white">{result.baseDenominator}</span>
                {result.adjustmentType !== 'none' && (
                  <span className="text-xs text-amber-300 font-semibold truncate">
                    ({result.adjustmentType === 'awl' ? `عالت إلى ${result.adjustedDenominator}` : 'ردية'})
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b3d2e] to-[#07261d] border border-[#c8a951]/30 min-w-0 overflow-hidden">
              <span className="text-[11px] text-[#e6cb7a] block">{t.inheritance.adjustmentType}</span>
              <p className="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c8a951] shrink-0" />
                <span className="truncate">
                  {result.adjustmentType === 'awl'
                    ? t.inheritance.awlDistribution
                    : result.adjustmentType === 'radd'
                    ? t.inheritance.raddDistribution
                    : t.inheritance.fairDistribution}
                </span>
              </p>
            </div>
          </div>

          {/* Shares Table */}
          <div className="bg-[#0b3d2e]/80 border border-[#c8a951]/25 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#c8a951]/20 pb-3">
              <h3 className="font-amiri font-bold text-xl text-[#f3e5ab] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c8a951]" />
                <span>{t.inheritance.results}</span>
              </h3>

              <button
                type="button"
                onClick={() => onOpenPdfModal({ type: 'inheritance', result, currency })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{t.exportPdf}</span>
              </button>
            </div>

            {/* Heirs list */}
            {result.heirsShares.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {language === 'ar' ? 'الرجاء تحديد الورثة لحساب التركة' : 'Please select at least one living heir.'}
              </div>
            ) : (
              <div className="space-y-3">
                {result.heirsShares.map((share, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#07261d]/90 border border-[#c8a951]/20 space-y-2 hover:border-[#c8a951]/40 transition min-w-0 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#0b3d2e] text-[#e6cb7a] flex items-center justify-center text-xs font-bold border border-[#c8a951]/30 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-amiri font-bold text-base text-white">
                            {language === 'ar' ? share.titleAr : share.titleEn}
                          </span>
                          <span className="text-[11px] text-[#e6cb7a] mx-2 font-mono">
                            [{share.shareFraction}]
                          </span>
                        </div>
                      </div>

                      <div className="text-end min-w-0 max-w-[50%]">
                        <span
                          className="font-amiri font-bold text-base sm:text-lg text-[#f3e5ab] truncate block"
                          title={`${Math.round(share.totalAmount).toLocaleString()} ${currency}`}
                        >
                          {Math.round(share.totalAmount).toLocaleString()} <span className="text-xs">{currency}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          ({share.sharePercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Per individual if multiple */}
                    {share.count > 1 && (
                      <div className="text-xs text-slate-300 bg-[#051a14]/60 px-2.5 py-1 rounded-lg border border-[#c8a951]/10 flex items-center justify-between min-w-0 overflow-hidden">
                        <span className="shrink-0">{t.inheritance.individualShare}:</span>
                        <span
                          className="font-bold text-[#e6cb7a] truncate max-w-[65%]"
                          title={`${Math.round(share.amountPerHeir).toLocaleString()} ${currency}`}
                        >
                          {Math.round(share.amountPerHeir).toLocaleString()} {currency}
                        </span>
                      </div>
                    )}

                    {/* Textual Quranic evidence */}
                    <div className="text-[11px] text-emerald-300/90 font-amiri bg-[#051a14]/40 p-2 rounded-lg border-s-2 border-[#c8a951] leading-relaxed">
                      {language === 'ar' ? share.evidenceAr : share.evidenceEn}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Heirs Section */}
          {result.blockedHeirs.length > 0 && (
            <div className="bg-[#0b3d2e]/60 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{t.inheritance.blockedHeirsTitle}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {result.blockedHeirs.map((b, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#07261d]/80 border border-amber-500/20 text-slate-300">
                    <span className="font-bold text-white block">
                      {language === 'ar' ? b.titleAr : b.titleEn}
                    </span>
                    <span className="text-[11px] text-amber-400">
                      {t.inheritance.blockedBy}: {language === 'ar' ? b.blockedByAr : b.blockedByEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
