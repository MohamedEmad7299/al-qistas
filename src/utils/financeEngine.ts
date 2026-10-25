export interface MudarabahResult {
  capital: number;
  profitOrLoss: number;
  isLoss: boolean;
  rabbAlMalProfitRatio: number;
  mudaribProfitRatio: number;
  rabbAlMalReturn: number;
  mudaribReturn: number;
  rabbAlMalTotalPayout: number;
  notesAr: string[];
  notesEn: string[];
}

export interface MusharakahResult {
  capitalA: number;
  capitalB: number;
  totalCapital: number;
  capitalSharePctA: number;
  capitalSharePctB: number;
  profitRatioA: number;
  profitRatioB: number;
  profitOrLoss: number;
  isLoss: boolean;
  shareA: number;
  shareB: number;
  payoutA: number;
  payoutB: number;
  notesAr: string[];
  notesEn: string[];
}

export interface MurabahaResult {
  assetCost: number;
  profitMarginPct: number;
  profitAmount: number;
  totalSellingPrice: number;
  tenorMonths: number;
  monthlyInstallment: number;
  notesAr: string[];
  notesEn: string[];
}

export function calculateMudarabah(params: {
  capital: number;
  profitOrLoss: number;
  isLoss: boolean;
  rabbAlMalRatioPct: number;
}): MudarabahResult {
  const capital = Math.max(0, Number(params.capital) || 0);
  const amount = Math.max(0, Number(params.profitOrLoss) || 0);
  const isLoss = !!params.isLoss;
  const rabbRatio = Math.min(100, Math.max(0, Number(params.rabbAlMalRatioPct) || 70)) / 100;
  const mudaribRatio = 1 - rabbRatio;

  if (isLoss) {
    // 100% financial loss borne by Rabb al-Mal
    const rabbReturn = -Math.min(amount, capital);
    const mudaribReturn = 0; // Mudarib loses effort
    const rabbPayout = Math.max(0, capital - amount);

    return {
      capital,
      profitOrLoss: amount,
      isLoss: true,
      rabbAlMalProfitRatio: rabbRatio * 100,
      mudaribProfitRatio: mudaribRatio * 100,
      rabbAlMalReturn: rabbReturn,
      mudaribReturn,
      rabbAlMalTotalPayout: rabbPayout,
      notesAr: [
        'قاعدة شرعية: الخسارة المالية في المضاربة يتحملها رب المال وحده في رأس ماله بالكامل، ولا يضمن المضارب شيئاً إلا إذا ثبت تعديه أو تفريطه أو مخالفته للشروط.',
        'خسارة المضارب تقتصر على جهده ووقته وعمله الذي لم يثمر ربحاً.',
        'لا يجوز اشتراط ضمان رأس المال على المضارب، وإن اشترط بطل العقد باتفاق الفقهاء.'
      ],
      notesEn: [
        'Shariah Rule: Financial loss in Mudarabah is borne exclusively by the capital provider (Rabb al-Mal). The manager (Mudarib) does not bear monetary loss unless misconduct or negligence is proven.',
        'The Mudarib\'s loss is represented by uncompensated time, effort, and labor.',
        'Guaranteeing capital against normal business risk by the Mudarib invalidates the contract.'
      ]
    };
  } else {
    // Profit sharing
    const rabbReturn = amount * rabbRatio;
    const mudaribReturn = amount * mudaribRatio;
    const rabbPayout = capital + rabbReturn;

    return {
      capital,
      profitOrLoss: amount,
      isLoss: false,
      rabbAlMalProfitRatio: rabbRatio * 100,
      mudaribProfitRatio: mudaribRatio * 100,
      rabbAlMalReturn: rabbReturn,
      mudaribReturn,
      rabbAlMalTotalPayout: rabbPayout,
      notesAr: [
        `يقتسم الطرفان الربح المحقق بنسبة شائعة معلومة (${Math.round(rabbRatio * 100)}% لرب المال، و ${Math.round(mudaribRatio * 100)}% للمضارب).`,
        'يسترد رب المال أصل رأس ماله كاملاً مضافاً إليه نصيبه من الأرباح.',
        'يشترط أن تكون النسبة محددة كحصة شائعة من الربح (كالنصف أو الثلث) وليس مبلغاً مقطوعاً محدداً.'
      ],
      notesEn: [
        `Profit is divided as an agreed percentage (${Math.round(rabbRatio * 100)}% to Capital Provider, ${Math.round(mudaribRatio * 100)}% to Manager).`,
        'The capital provider recovers initial capital plus their designated profit portion.',
        'Profit shares must be designated as a floating percentage of net profit, never as a guaranteed fixed amount.'
      ]
    };
  }
}

export function calculateMusharakah(params: {
  capitalA: number;
  capitalB: number;
  profitRatioA: number;
  profitOrLoss: number;
  isLoss: boolean;
}): MusharakahResult {
  const capA = Math.max(0, Number(params.capitalA) || 0);
  const capB = Math.max(0, Number(params.capitalB) || 0);
  const total = capA + capB;

  const pctA = total > 0 ? (capA / total) * 100 : 50;
  const pctB = total > 0 ? (capB / total) * 100 : 50;

  const pRatioA = Math.min(100, Math.max(0, Number(params.profitRatioA) || pctA)) / 100;
  const pRatioB = 1 - pRatioA;

  const amount = Math.max(0, Number(params.profitOrLoss) || 0);
  const isLoss = !!params.isLoss;

  let shareA = 0;
  let shareB = 0;
  let payoutA = 0;
  let payoutB = 0;

  if (isLoss) {
    // Loss must strictly follow capital proportions!
    const lossA = (pctA / 100) * amount;
    const lossB = (pctB / 100) * amount;
    shareA = -lossA;
    shareB = -lossB;
    payoutA = Math.max(0, capA - lossA);
    payoutB = Math.max(0, capB - lossB);

    return {
      capitalA: capA,
      capitalB: capB,
      totalCapital: total,
      capitalSharePctA: pctA,
      capitalSharePctB: pctB,
      profitRatioA: pRatioA * 100,
      profitRatioB: pRatioB * 100,
      profitOrLoss: amount,
      isLoss: true,
      shareA,
      shareB,
      payoutA,
      payoutB,
      notesAr: [
        'قاعدة إجماعية في الفقه الإسلامي: «الوضيعة (الخسارة) على قدر المالين» بالإجماع.',
        `تحمل الطرف (أ) نسبة ${pctA.toFixed(1)}% من الخسارة، والطرف (ب) ${pctB.toFixed(1)}% بدقة طبقاً لحصة رأس المال.`,
        'أي شرط يقضي بتحميل أحد الشركاء نسبة خسارة تختلف عن نسبة مساهمته في رأس المال فهو شرط باطل شرعاً.'
      ],
      notesEn: [
        'Consensus Rule in Islamic Jurisprudence: Loss is distributed strictly proportional to capital invested.',
        `Party A bears ${pctA.toFixed(1)}% of loss, and Party B bears ${pctB.toFixed(1)}% matching their capital ratio.`,
        'Any contractual clause distributing loss differently from capital shares is null and void.'
      ]
    };
  } else {
    // Profit follows agreed ratio
    shareA = amount * pRatioA;
    shareB = amount * pRatioB;
    payoutA = capA + shareA;
    payoutB = capB + shareB;

    return {
      capitalA: capA,
      capitalB: capB,
      totalCapital: total,
      capitalSharePctA: pctA,
      capitalSharePctB: pctB,
      profitRatioA: pRatioA * 100,
      profitRatioB: pRatioB * 100,
      profitOrLoss: amount,
      isLoss: false,
      shareA,
      shareB,
      payoutA,
      payoutB,
      notesAr: [
        'قاعدة شرعية: «الربح على ما شرطا»؛ يجوز أن تختلف نسبة اقتسام الربح عن نسبة رأس المال إذا كان أحد الشركاء يقوم بالعمل أو الإدارة.',
        `حصل الطرف (أ) على ${Math.round(pRatioA * 100)}% من الأرباح والطرف (ب) على ${Math.round(pRatioB * 100)}%.`
      ],
      notesEn: [
        'Shariah Rule: Profit sharing may deviate from capital contribution ratios if agreed upon (e.g., due to extra management effort).',
        `Party A receives ${Math.round(pRatioA * 100)}% of profit, and Party B receives ${Math.round(pRatioB * 100)}%.`
      ]
    };
  }
}

export function calculateMurabaha(params: {
  assetCost: number;
  marginPct: number;
  tenorMonths: number;
}): MurabahaResult {
  const cost = Math.max(0, Number(params.assetCost) || 0);
  const marginPct = Math.max(0, Number(params.marginPct) || 10);
  const tenor = Math.max(1, Math.floor(Number(params.tenorMonths) || 12));

  const profitAmount = cost * (marginPct / 100);
  const totalSellingPrice = cost + profitAmount;
  const monthlyInstallment = totalSellingPrice / tenor;

  return {
    assetCost: cost,
    profitMarginPct: marginPct,
    profitAmount,
    totalSellingPrice,
    tenorMonths: tenor,
    monthlyInstallment,
    notesAr: [
      'المرابحة الشرعية: بيع بثمن التكلفة المعلوم مع زيادة ربح معلوم متفق عليه صراحة بين الطرفين.',
      'يشترط أن يملك البائع (أو البنك الإسلامي) السلعة ويقبضها قبضاً صحيحاً قبل بيعها للآمر بالشراء تجنباً لبيع ما لا يملك.',
      'الثمن الإجمالي قطعي وثابت في ذمة المشتري، ولا يجوز فرض غرامات تأخير تصب في دخل البنك لأنها تؤول للربا المحرم.'
    ],
    notesEn: [
      'Murabaha contract: A transparent cost-plus markup sale where cost and profit are disclosed upfront.',
      'The seller/Islamic bank must own and take possession of the goods before concluding the sale to avoid selling what one does not possess.',
      'The total price is final and fixed; late payment penalties cannot be taken as bank profit as that constitutes Riba.'
    ]
  };
}
