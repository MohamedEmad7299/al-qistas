import { ZakatInput, ZakatResult } from '../types';

export function calculateZakat(input: ZakatInput): ZakatResult {
  const currency = input.currency || 'USD';
  const goldPrice = Math.max(0, Number(input.goldPricePerGram) || 0);
  const silverPrice = Math.max(0, Number(input.silverPricePerGram) || 0);

  const goldNisabGrams = 85;
  const silverNisabGrams = 595;

  const goldNisabVal = goldNisabGrams * goldPrice;
  const silverNisabVal = silverNisabGrams * silverPrice;

  const nisabThreshold = input.nisabStandard === 'silver' ? silverNisabVal : goldNisabVal;

  // Gold values by karat
  const gold24kGrams = Math.max(0, Number(input.gold24k) || 0);
  const gold21kGrams = Math.max(0, Number(input.gold21k) || 0);
  const gold18kGrams = Math.max(0, Number(input.gold18k) || 0);
  const silverGrams = Math.max(0, Number(input.silverGrams) || 0);

  const goldValue = (gold24kGrams * goldPrice) +
                    (gold21kGrams * goldPrice * (21 / 24)) +
                    (gold18kGrams * goldPrice * (18 / 24));
  const silverValue = silverGrams * silverPrice;

  const cash = Math.max(0, Number(input.cashOnHand) || 0);
  const bank = Math.max(0, Number(input.bankDeposits) || 0);
  const trade = Math.max(0, Number(input.tradeGoods) || 0);
  const receivables = Math.max(0, Number(input.receivables) || 0);
  const deductibleDebts = Math.max(0, Number(input.deductibleDebts) || 0);

  const totalGrossWealth = cash + bank + goldValue + silverValue + trade + receivables;
  const totalDeductions = deductibleDebts;
  const netZakatWealth = Math.max(0, totalGrossWealth - totalDeductions);

  const isEligibleForZakat = input.isHawlCompleted && netZakatWealth >= nisabThreshold && nisabThreshold > 0;
  const rateApplied = input.useSolarCalendar ? 0.02577 : 0.025; // 2.577% solar vs 2.5% lunar

  const zakatMalDue = isEligibleForZakat ? netZakatWealth * rateApplied : 0;

  // 1. Zakat al-Fitr
  const fitrPersons = Math.max(0, Number(input.fitrMembers) || 0);
  const fitrRate = Math.max(0, Number(input.fitrPricePerSaa) || 0);
  const fitrTotalSaa = fitrPersons;
  const fitrDueAmount = fitrPersons * fitrRate;

  // 2. Agricultural Zakat
  const cropYieldKg = Math.max(0, Number(input.cropYieldKg) || 0);
  const cropPrice = Math.max(0, Number(input.cropPricePerKg) || 0);
  const cropsNisabKg = 653; // 5 Wasaq
  const cropsEligible = cropYieldKg >= cropsNisabKg;
  let cropsRate = 0.10;
  if (input.cropIrrigation === 'artificial') cropsRate = 0.05;
  else if (input.cropIrrigation === 'mixed') cropsRate = 0.075;

  const cropsDueKg = cropsEligible ? cropYieldKg * cropsRate : 0;
  const cropsDueValue = cropsDueKg * cropPrice;

  // 3. Livestock Zakat
  const camels = Math.max(0, Math.floor(Number(input.camels) || 0));
  const cattle = Math.max(0, Math.floor(Number(input.cattle) || 0));
  const sheep = Math.max(0, Math.floor(Number(input.sheep) || 0));

  const livestockObligations: ZakatResult['livestockObligations'] = [];

  // Camels calculation
  if (camels >= 5) {
    let obligationAr = '';
    let obligationEn = '';
    let descAr = '';
    let descEn = '';

    if (camels <= 9) {
      obligationAr = 'شاة واحدة (من الغنم)';
      obligationEn = '1 Sheep';
      descAr = 'من 5 إلى 9 إبل: تجب شاة واحدة تجزئ في الأضحية';
      descEn = '5-9 camels: 1 sheep (suitable for sacrifice)';
    } else if (camels <= 14) {
      obligationAr = 'شاتان (2 من الغنم)';
      obligationEn = '2 Sheep';
      descAr = 'من 10 إلى 14 إبلاً: تجب شاتان';
      descEn = '10-14 camels: 2 sheep';
    } else if (camels <= 19) {
      obligationAr = 'ثلاث شياه (3 من الغنم)';
      obligationEn = '3 Sheep';
      descAr = 'من 15 إلى 19 إبلاً: ثلاث شياه';
      descEn = '15-19 camels: 3 sheep';
    } else if (camels <= 24) {
      obligationAr = 'أربع شياه (4 من الغنم)';
      obligationEn = '4 Sheep';
      descAr = 'من 20 إلى 24 إبلاً: أربع شياه';
      descEn = '20-24 camels: 4 sheep';
    } else if (camels <= 35) {
      obligationAr = 'بنت مخاض (ناقة أتمت سنة)';
      obligationEn = '1 Bint Makhad (1-yr-old female camel)';
      descAr = 'من 25 إلى 35 إبلاً: ناقة أتمت سنة ودخلت في الثانية';
      descEn = '25-35 camels: 1-year-old female camel';
    } else if (camels <= 45) {
      obligationAr = 'بنت لبون (ناقة أتمت سنتين)';
      obligationEn = '1 Bint Labun (2-yr-old female camel)';
      descAr = 'من 36 إلى 45 إبلاً: ناقة أتمت سنتين ودخلت في الثالثة';
      descEn = '36-45 camels: 2-year-old female camel';
    } else if (camels <= 60) {
      obligationAr = 'حِقّة (ناقة أتمت 3 سنوات)';
      obligationEn = '1 Hiqqah (3-yr-old female camel)';
      descAr = 'من 46 إلى 60 إبلاً: ناقة أتمت ثلاث سنوات ودخلت في الرابعة';
      descEn = '46-60 camels: 3-year-old female camel';
    } else if (camels <= 75) {
      obligationAr = 'جَذَعَة (ناقة أتمت 4 سنوات)';
      obligationEn = '1 Jadha\'ah (4-yr-old female camel)';
      descAr = 'من 61 إلى 75 إبلاً: ناقة أتمت أربع سنوات ودخلت في الخامسة';
      descEn = '61-75 camels: 4-year-old female camel';
    } else if (camels <= 90) {
      obligationAr = 'بنتا لبون (ناقتان أتمت كل منهما سنتين)';
      obligationEn = '2 Bint Labun';
      descAr = 'من 76 إلى 90 إبلاً: ناقتان كل منهما بنت لبون';
      descEn = '76-90 camels: 2 Bint Labun';
    } else if (camels <= 120) {
      obligationAr = 'حِقَّتان (ناقتان أتمت كل منهما 3 سنوات)';
      obligationEn = '2 Hiqqah';
      descAr = 'من 91 إلى 120 إبلاً: ناقتان كل منهما حقة';
      descEn = '91-120 camels: 2 Hiqqah';
    } else {
      // Over 120: in every 40 a Bint Labun, in every 50 a Hiqqah
      // Find best combination
      let bestBintLabun = 0;
      let bestHiqqah = 0;
      let minRemainder = 999999;
      for (let h = 0; h * 50 <= camels; h++) {
        const rem = camels - h * 50;
        const b = Math.floor(rem / 40);
        const leftover = rem - b * 40;
        if (leftover < minRemainder) {
          minRemainder = leftover;
          bestHiqqah = h;
          bestBintLabun = b;
        }
      }
      obligationAr = `${bestBintLabun > 0 ? `${bestBintLabun} بنت لبون ` : ''}${bestHiqqah > 0 ? `${bestHiqqah} حِقّة` : ''}`.trim();
      obligationEn = `${bestBintLabun > 0 ? `${bestBintLabun} Bint Labun ` : ''}${bestHiqqah > 0 ? `${bestHiqqah} Hiqqah` : ''}`.trim();
      descAr = `فوق 120: في كل 40 بنت لبون، وفي كل 50 حقة`;
      descEn = `Above 120: 1 Bint Labun per 40, and 1 Hiqqah per 50`;
    }

    livestockObligations.push({
      type: 'camels',
      count: camels,
      obligationAr,
      obligationEn,
      descriptionAr: descAr,
      descriptionEn: descEn
    });
  }

  // Cattle calculation
  if (cattle >= 30) {
    let bestTabi = 0;
    let bestMusinnah = 0;
    let minRemainder = 999999;

    for (let m = 0; m * 40 <= cattle; m++) {
      const rem = cattle - m * 40;
      const t = Math.floor(rem / 30);
      const leftover = rem - t * 30;
      if (leftover < minRemainder) {
        minRemainder = leftover;
        bestMusinnah = m;
        bestTabi = t;
      }
    }

    const partsAr: string[] = [];
    const partsEn: string[] = [];
    if (bestTabi > 0) {
      partsAr.push(`${bestTabi} تبيع (عجل أتم سنة)`);
      partsEn.push(`${bestTabi} Tabi' (1-yr-old calf)`);
    }
    if (bestMusinnah > 0) {
      partsAr.push(`${bestMusinnah} مُسِنّة (بقرة أتمت سنتين)`);
      partsEn.push(`${bestMusinnah} Musinnah (2-yr-old cow)`);
    }

    livestockObligations.push({
      type: 'cattle',
      count: cattle,
      obligationAr: partsAr.join(' وَ '),
      obligationEn: partsEn.join(' and '),
      descriptionAr: 'في كل 30 بقرة تبيع، وفي كل 40 بقرة مسنة (حديث معاذ بن جبل)',
      descriptionEn: '1 Tabi\' per 30 cattle, and 1 Musinnah per 40 cattle'
    });
  }

  // Sheep calculation
  if (sheep >= 40) {
    let sheepObligation = 0;
    let descAr = '';
    let descEn = '';

    if (sheep <= 120) {
      sheepObligation = 1;
      descAr = 'من 40 إلى 120 شاة: شاة واحدة';
      descEn = '40 to 120 sheep: 1 sheep';
    } else if (sheep <= 200) {
      sheepObligation = 2;
      descAr = 'من 121 إلى 200 شاة: شاتان';
      descEn = '121 to 200 sheep: 2 sheep';
    } else if (sheep <= 399) {
      sheepObligation = 3;
      descAr = 'من 201 إلى 399 شاة: ثلاث شياه';
      descEn = '201 to 399 sheep: 3 sheep';
    } else {
      sheepObligation = Math.floor(sheep / 100);
      descAr = 'من 400 فأكثر: في كل مائة شاة شاة واحدة';
      descEn = '400 and above: 1 sheep for every 100 sheep';
    }

    livestockObligations.push({
      type: 'sheep',
      count: sheep,
      obligationAr: `${sheepObligation} شاة`,
      obligationEn: `${sheepObligation} Sheep`,
      descriptionAr: descAr,
      descriptionEn: descEn
    });
  }

  // 4. Rikaz
  const rikazValue = Math.max(0, Number(input.rikazValue) || 0);
  const rikazDue = rikazValue * 0.20; // 20% (Khums)

  // 5. Stocks
  const stocksTradingValue = Math.max(0, Number(input.stocksTradingValue) || 0);
  const stocksInvestmentDividends = Math.max(0, Number(input.stocksInvestmentDividends) || 0);
  const stocksZakatDue = (stocksTradingValue * rateApplied) + (stocksInvestmentDividends * 0.10); // 10% on dividends or 2.5% on active

  const grandTotalZakat = zakatMalDue + fitrDueAmount + cropsDueValue + rikazDue + stocksZakatDue;

  return {
    currency,
    goldNisabGrams,
    silverNisabGrams,
    nisabThreshold,
    isEligibleForZakat,
    totalGrossWealth,
    totalDeductions,
    netZakatWealth,
    rateApplied,
    zakatMalDue,
    fitrTotalSaa,
    fitrDueAmount,
    cropsEligible,
    cropsRate,
    cropsDueKg,
    cropsDueValue,
    livestockObligations,
    rikazDue,
    stocksZakatDue,
    grandTotalZakat
  };
}
