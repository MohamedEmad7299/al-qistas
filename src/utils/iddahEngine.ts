import { gregorianToHijri } from './calendarEngine';

export interface IddahResult {
  type: string;
  titleAr: string;
  titleEn: string;
  quranicEvidenceAr: string;
  quranicEvidenceEn: string;
  startDate: Date;
  endDate: Date;
  totalDurationDays: number;
  remainingDays: number;
  isCompleted: boolean;
  startDateHijri: string;
  endDateHijri: string;
  rulingsAr: string[];
  rulingsEn: string[];
}

export function calculateIddah(params: {
  type: 'widowhood' | 'divorce_cycle' | 'divorce_months' | 'pregnant';
  startDateStr: string;
  cycleLengthDays?: number;
  expectedDeliveryDateStr?: string;
}): IddahResult {
  const startDate = new Date(params.startDateStr || new Date().toISOString().split('T')[0]);
  const today = new Date();
  
  let endDate = new Date(startDate);
  let totalDays = 130;
  let titleAr = '';
  let titleEn = '';
  let quranicAr = '';
  let quranicEn = '';
  let rulingsAr: string[] = [];
  let rulingsEn: string[] = [];

  if (params.type === 'widowhood') {
    titleAr = 'عدة المتوفى عنها زوجها (4 أشهر وعشرة أيام)';
    titleEn = 'Widowhood \'Iddah (4 Lunar Months & 10 Days)';
    quranicAr = '﴿وَالَّذِينَ يُتَوَفَّوْنَ مِنكُمْ وَيَذَرُونَ أَزْوَاجًا يَتَرَبَّصْنَ بِأَنفُسِهِنَّ أَرْبَعَةَ أَشْهُرٍ وَعَشْرًا﴾ [البقرة: 234]';
    quranicEn = 'Quran: "And those who are taken in death among you and leave wives behind - they shall wait, for themselves, four months and ten days" [2:234]';
    totalDays = 130; // 4 * 29.5 (rounded to 120 days) + 10 days = 130 days
    endDate.setDate(startDate.getDate() + totalDays);

    rulingsAr = [
      'وجوب الإحداد: ترك الزينة والطيب والكحل والحلي والثياب المصبوغة للزينة.',
      'لزوم بيت الزوجية: تمكث المعتدة في البيت الذي كانت تسكنه عند وفاة زوجها ولا تخرج ليلاً إلا لضرورة، ويجوز الخروج نهاراً لحاجتها (كالعمل والعلاج).',
      'تحريم الخطبة تصريحاً، ويجوز التعريض فقط لقوله تعالى: ﴿وَلَا جُنَاحَ عَلَيْكُمْ فِيمَا عَرَّضْتُم بِهِ مِنْ خِطْبَةِ النِّسَاءِ﴾.',
      'تحريم عقد النكاح حتى تنقضي العدة انقضاءً تاماً.'
    ];

    rulingsEn = [
      'Mourning (Ihdad): Refraining from beautification, perfumes, jewelry, cosmetics, and festive clothing.',
      'Residing in the marital home: The widow remains in the residence she occupied at the husband\'s passing, not leaving overnight except for necessity.',
      'Prohibition of explicit marriage proposals; indirect allusions (Ta\'reed) are permissible.',
      'Absolute prohibition of entering into marriage until the full term has elapsed.'
    ];
  } else if (params.type === 'divorce_cycle') {
    titleAr = 'عدة المطلقة من ذوات الحيض (3 قروء / حيضات)';
    titleEn = 'Divorce \'Iddah with Regular Menstruation (3 Clean Periods / Quru\')';
    quranicAr = '﴿وَالْمُطَلَّقَاتُ يَتَرَبَّصْنَ بِأَنفُسِهِنَّ ثَلَاثَةَ قُرُوءٍ﴾ [البقرة: 228]';
    quranicEn = 'Quran: "Divorced women remain in waiting for three periods" [2:228]';
    const cycle = Number(params.cycleLengthDays) || 28;
    totalDays = cycle * 3; // Approx 3 cycles
    endDate.setDate(startDate.getDate() + totalDays);

    rulingsAr = [
      'إذا كان الطلاق رجعياً (الطلقة الأولى أو الثانية دون عوض)، للمعتدة كامل حقوق الزوجة في النفقة والسكنى، وللزوج مراجعتها دون عقد أو مهر جديدين.',
      'تنقضي العدة برؤية الطهر من الحيضة الثالثة.',
      'إذا كان الطلاق بائناً بينونة صغرى أو كبرى، لا تجوز الرجعة إلا بعقد ومهر جديدين (أو بعد زواج آخر في الكبرى).'
    ];

    rulingsEn = [
      'If the divorce is revocable (1st or 2nd), the wife retains full rights to housing and maintenance, and the husband may revoke the divorce without a new contract or dowry.',
      'The term concludes when purification is established from the third period.',
      'If irrevocable, remarriage requires a new contract and dowry (or marrying another after a triple divorce).'
    ];
  } else if (params.type === 'divorce_months') {
    titleAr = 'عدة المطلقة الآيسة أو التي لم تحض (3 أشهر قمرية)';
    titleEn = 'Divorce \'Iddah for Non-Menstruating / Menopausal (3 Lunar Months)';
    quranicAr = '﴿وَاللَّائِي يَئِسْنَ مِنَ الْمَحِيضِ مِن نِّسَائِكُمْ إِنِ ارْتَبْتُمْ فَعِدَّتُهُنَّ ثَلَاثَةُ أَشْهُرٍ وَاللَّائِي لَمْ يَحِضْنَ﴾ [الطلاق: 4]';
    quranicEn = 'Quran: "And those who no longer expect menstruation among your women - if you doubt, then their period is three months, and [also for] those who have not menstruated" [65:4]';
    totalDays = 89; // 3 lunar months approx 88.5 to 89 days
    endDate.setDate(startDate.getDate() + totalDays);

    rulingsAr = [
      'تطبق على المرأة التي بلغت سن اليأس، أو الصغيرة التي لم تحض، أو من استؤصل رحمها.',
      'تُحسب بالشهور الهلالية القمرية، وثلاثة أشهر تعادل تقريباً 89 يوماً.',
      'تجب لها السكنى والنفقة إذا كان الطلاق رجعياً.'
    ];

    rulingsEn = [
      'Applies to women past menopause, young women who have not begun menstruation, or hysterectomy patients.',
      'Calculated based on three complete lunar cycles (~89 calendar days).',
      'Housing and maintenance remain obligatory in revocable divorces.'
    ];
  } else {
    titleAr = 'عدة الحامل (بوضع الحمل)';
    titleEn = 'Pregnant Woman \'Iddah (Terminates upon Childbirth)';
    quranicAr = '﴿وَأُولَاتُ الْأَحْمَالِ أَجَلُهُنَّ أَن يَضَعْنَ حَمْلَهُنَّ﴾ [الطلاق: 4]';
    quranicEn = 'Quran: "And for those who are pregnant, their term is until they give birth" [65:4]';
    
    if (params.expectedDeliveryDateStr) {
      endDate = new Date(params.expectedDeliveryDateStr);
      totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      totalDays = 270; // 9 months average
      endDate.setDate(startDate.getDate() + totalDays);
    }

    rulingsAr = [
      'تنتهي العدة لحظة خروج الجنين بالكامل، سواء كان الطلاق رجعياً أو بائناً أو بوفاة الزوج بالإجماع لعموم الآية وحديث سُبَيعة الأسلمية.',
      'تجب لها النفقة والسكنى طيلة فترة الحمل حتى تضع حملها إجماعاً لقوله تعالى: ﴿وَإِن كُنَّ أُولَاتِ حَمْلٍ فَأَنفِقُوا عَلَيْهِنَّ حَتَّىٰ يَضَعْنَ حَمْلَهُنَّ﴾.'
    ];

    rulingsEn = [
      'The term concludes at the exact moment of delivery, whether the cause was divorce or widowhood (Consensus based on the hadith of Subay\'ah al-Aslamiyyah).',
      'Full maintenance and lodging are mandatory throughout pregnancy until delivery.'
    ];
  }

  const diffMs = endDate.getTime() - today.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isCompleted = remainingDays === 0;

  const startHijri = gregorianToHijri(startDate);
  const endHijri = gregorianToHijri(endDate);

  return {
    type: params.type,
    titleAr,
    titleEn,
    quranicEvidenceAr: quranicAr,
    quranicEvidenceEn: quranicEn,
    startDate,
    endDate,
    totalDurationDays: totalDays,
    remainingDays,
    isCompleted,
    startDateHijri: startHijri.formattedAr,
    endDateHijri: endHijri.formattedAr,
    rulingsAr,
    rulingsEn
  };
}
