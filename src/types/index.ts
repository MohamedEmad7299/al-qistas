export type Language = 'ar' | 'en';

export interface HeirsInput {
  husband?: boolean;
  wives?: number;
  sons?: number;
  daughters?: number;
  grandsons?: number;
  granddaughters?: number;
  father?: boolean;
  mother?: boolean;
  paternalGrandfather?: boolean;
  paternalGrandmother?: boolean;
  maternalGrandmother?: boolean;
  fullBrothers?: number;
  fullSisters?: number;
  paternalBrothers?: number;
  paternalSisters?: number;
  maternalBrothers?: number;
  maternalSisters?: number;
  nephewsFull?: number;
  nephewsPaternal?: number;
  unclesFull?: number;
  unclesPaternal?: number;
  cousinsFull?: number;
  cousinsPaternal?: number;
}

export interface InheritanceInput {
  deceasedGender: 'male' | 'female';
  estateValue: number;
  debts: number;
  funeralExpenses: number;
  wasiyyah: number;
  heirs: HeirsInput;
}

export interface HeirShareDetail {
  heirKey: string;
  titleAr: string;
  titleEn: string;
  count: number;
  shareFraction: string;
  shareDecimal: number;
  sharePercent: number;
  totalAmount: number;
  amountPerHeir: number;
  shareType: 'fard' | 'asabah' | 'fard_and_asabah';
  evidenceAr: string;
  evidenceEn: string;
  notesAr?: string;
  notesEn?: string;
}

export interface BlockedHeirDetail {
  heirKey: string;
  titleAr: string;
  titleEn: string;
  count: number;
  blockedByAr: string;
  blockedByEn: string;
}

export interface InheritanceResult {
  grossEstate: number;
  debts: number;
  funeralExpenses: number;
  wasiyyah: number;
  netEstate: number;
  baseDenominator: number;
  adjustedDenominator: number;
  adjustmentType: 'none' | 'awl' | 'radd';
  heirsShares: HeirShareDetail[];
  blockedHeirs: BlockedHeirDetail[];
  totalDistributed: number;
  remainingEstate: number;
}

export interface ZakatInput {
  currency: string;
  goldPricePerGram: number;
  silverPricePerGram: number;
  nisabStandard: 'gold' | 'silver';
  cashOnHand: number;
  bankDeposits: number;
  gold24k: number;
  gold21k: number;
  gold18k: number;
  silverGrams: number;
  tradeGoods: number;
  receivables: number;
  deductibleDebts: number;
  isHawlCompleted: boolean;
  useSolarCalendar: boolean;
  
  // Zakat al-Fitr
  fitrMembers: number;
  fitrPricePerSaa: number;
  
  // Agriculture
  cropYieldKg: number;
  cropIrrigation: 'natural' | 'artificial' | 'mixed';
  cropPricePerKg: number;

  // Livestock
  camels: number;
  cattle: number;
  sheep: number;

  // Rikaz
  rikazValue: number;

  // Stocks
  stocksTradingValue: number;
  stocksInvestmentDividends: number;
}

export interface ZakatResult {
  currency: string;
  goldNisabGrams: number;
  silverNisabGrams: number;
  nisabThreshold: number;
  isEligibleForZakat: boolean;
  totalGrossWealth: number;
  totalDeductions: number;
  netZakatWealth: number;
  rateApplied: number;
  zakatMalDue: number;
  
  // Fitr
  fitrTotalSaa: number;
  fitrDueAmount: number;

  // Crops
  cropsEligible: boolean;
  cropsRate: number;
  cropsDueKg: number;
  cropsDueValue: number;

  // Livestock
  livestockObligations: Array<{
    type: 'camels' | 'cattle' | 'sheep';
    count: number;
    obligationAr: string;
    obligationEn: string;
    descriptionAr: string;
    descriptionEn: string;
  }>;

  // Rikaz
  rikazDue: number;

  // Stocks
  stocksZakatDue: number;

  // Grand Total
  grandTotalZakat: number;
}

export interface PrayerTimeItem {
  id: string;
  nameAr: string;
  nameEn: string;
  timeString: string;
  timestamp: Date;
  isNext?: boolean;
}

export interface QiblaInfo {
  bearing: number;
  compassAngle: number;
  distanceKm: number;
  directionCardinal: string;
}

export interface HijriDateInfo {
  day: number;
  month: number;
  year: number;
  monthNameAr: string;
  monthNameEn: string;
  gregorianDate: Date;
  formattedAr: string;
  formattedEn: string;
  dayOfWeekAr: string;
  dayOfWeekEn: string;
}

export interface MoonPhaseInfo {
  phase: number; // 0 to 1
  illuminationPct: number;
  ageDays: number;
  phaseNameAr: string;
  phaseNameEn: string;
}

export interface IslamicOccasion {
  id: string;
  titleAr: string;
  titleEn: string;
  hijriDay: number;
  hijriMonth: number;
  gregorianEstimate: string;
  daysRemaining: number;
  descriptionAr: string;
  descriptionEn: string;
}
