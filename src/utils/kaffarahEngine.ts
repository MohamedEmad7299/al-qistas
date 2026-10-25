export interface KaffarahResult {
  category: string;
  titleAr: string;
  titleEn: string;
  quranicRefAr: string;
  quranicRefEn: string;
  primaryObligationAr: string;
  primaryObligationEn: string;
  foodQuantityKg: number;
  mealsCount: number;
  estimatedCost: number;
  fastingAlternativeDays: number;
  detailsAr: string[];
  detailsEn: string[];
}

export function calculateKaffarah(params: {
  type: 'oath' | 'fast_breach' | 'fidyah' | 'diyah';
  mealPrice: number;
  missedDays?: number;
  currency?: string;
  goldPricePerGram?: number;
}): KaffarahResult {
  const mealPrice = Math.max(0, Number(params.mealPrice) || 5);
  const missedDays = Math.max(1, Number(params.missedDays) || 1);
  const goldPrice = Math.max(0, Number(params.goldPricePerGram) || 85);

  if (params.type === 'oath') {
    return {
      category: 'oath',
      titleAr: 'كفارة اليمين المنعقدة',
      titleEn: 'Kaffarah for Broken Oath (Yameen)',
      quranicRefAr: '﴿لَا يُؤَاخِذُكُمُ اللَّهُ بِاللَّغْوِ فِي أَيْمَانِكُمْ وَلَٰكِن يُؤَاخِذُكُم بِمَا عَقَّدتُّمُ الْأَيْمَانَ ۖ فَكَفَّارَتُهُ إِطْعَامُ عَشَرَةِ مَسَاكِينَ مِنْ أَوْسَطِ مَا تُطْعِمُونَ أَهْلِيكُمْ أَوْ كِسْوَتُهُمْ أَوْ تَحْرِيرُ رَقَبَةٍ ۖ فَمَن لَّمْ يَجِدْ فَصِيَامُ ثَلَاثَةِ أَيَّامٍ﴾ [المائدة: 89]',
      quranicRefEn: 'Quran: "Its expiation is the feeding of ten needy people from the average of that which you feed your families, or clothing them or freeing a slave; but whoever cannot find - then a fast of three days" [5:89]',
      primaryObligationAr: 'إطعام عشرة مساكين أو كسوتهم بالتخيير',
      primaryObligationEn: 'Feed ten needy persons or clothe them (choice)',
      foodQuantityKg: 7.5, // 10 * 0.75 kg (1 Mudd per person)
      mealsCount: 10,
      estimatedCost: 10 * mealPrice,
      fastingAlternativeDays: 3,
      detailsAr: [
        'المقدار الواجب: مُدّ من طعام (أرز أو قمح ≈ 750 جرام) لكل مسكين، أي 7.5 كجم إجمالاً، أو تقديم 10 وجبات مشبعة.',
        'يجوز إخراج القيمة نقداً عند الحنفية وجمع من العلماء للمصلحة الراجحة للفقير.',
        'لا يُنتقل إلى صيام الأيام الثلاثة إلا عند العجز المالي التام عن الإطعام أو الكسوة.'
      ],
      detailsEn: [
        'Required measure: 1 Mudd (~750g of staple grain) per person, total 7.5 kg, or 10 satisfying meals.',
        'Monetary value may be paid in cash according to the Hanafi school and contemporary councils for poverty alleviation.',
        'Fasting for 3 days is permissible only when financially incapable of feeding or clothing.'
      ]
    };
  }

  if (params.type === 'fast_breach') {
    return {
      category: 'fast_breach',
      titleAr: 'كفارة الجماع العمد في نهار رمضان',
      titleEn: 'Kaffarah for Deliberate Invalidation of Ramadan Fast',
      quranicRefAr: 'حديث أبي هريرة رضي الله عنه: جاء رجل إلى النبي ﷺ فقال: هلكت! قال: «وما أهلكك؟» قال: وقعت على امرأتي في رمضان.. (متفق عليه)',
      quranicRefEn: 'Hadith: A man came to the Prophet ﷺ and said, "I am ruined! I had intercourse with my wife in Ramadan..." [Sahih al-Bukhari & Muslim]',
      primaryObligationAr: 'صيام شهرين متتابعين، فإن عجز فإطعام ستين مسكيناً',
      primaryObligationEn: 'Fast two consecutive months (60 days); if unable, feed 60 needy persons',
      foodQuantityKg: 45, // 60 * 0.75 kg
      mealsCount: 60,
      estimatedCost: 60 * mealPrice,
      fastingAlternativeDays: 60,
      detailsAr: [
        'الكفارة هنا على الترتيب: 1) عتق رقبة مؤمنة (متعذر اليوم)، 2) صيام شهرين متتابعين (60 يوماً متواصلة دون انقطاع إلا لعذر شرعي)، 3) إطعام 60 مسكيناً عند العجز عن الصيام.',
        'مقدار الإطعام: 60 مُدَّاً (حوالي 45 كجم أرز أو قمح) أو إطعامهم وجبة غداء أو عشاء مشبعة.',
        'يلزم مع الكفارة قضاء ذلك اليوم الذي أفسده والتوبة الصادقة.'
      ],
      detailsEn: [
        'Strict hierarchical order: 1) Free a slave (inapplicable today), 2) Fast 60 consecutive days, 3) Feed 60 needy persons if medically incapable of fasting.',
        'Feeding measure: 60 Mudds (~45 kg staple grain) or 60 satisfying meals.',
        'Must also make up (Qada\') the broken single day alongside sincere repentance.'
      ]
    };
  }

  if (params.type === 'fidyah') {
    const totalMeals = missedDays;
    const totalKg = missedDays * 0.75;
    return {
      category: 'fidyah',
      titleAr: 'فدية العاجز عن الصيام (كبر سن أو مرض مزمن)',
      titleEn: 'Fidyah for Chronic Inability to Fast',
      quranicRefAr: '﴿وَعَلَى الَّذِينَ يُطِيقُونَهُ فِدْيَةٌ طَعَامُ مِسْكِينٍ﴾ [البقرة: 184]',
      quranicRefEn: 'Quran: "And upon those who are able [to fast only] with extreme difficulty - a ransom [as substitute] of feeding a poor person [each day]" [2:184]',
      primaryObligationAr: `إطعام مسكين واحد عن كل يوم أفطره (${missedDays} مساكين)`,
      primaryObligationEn: `Feed one poor person for each missed day (${missedDays} meals)`,
      foodQuantityKg: totalKg,
      mealsCount: totalMeals,
      estimatedCost: totalMeals * mealPrice,
      fastingAlternativeDays: 0,
      detailsAr: [
        `تجب الفدية على الشيخ الكبير والمرأة العجوز والمريض مرضاً مزمناً لا يُرجى شفاؤه.`,
        `المقدار عن كل يوم: مُد من طعام (حوالي 750 جرام) أو وجبة مشبعة، بإجمالي ${totalKg} كجم عن ${missedDays} يوماً.`,
        'يجوز إخراجها يوماً بيوم، أو جمعها وإخراجها كاملة في نهاية شهر رمضان.'
      ],
      detailsEn: [
        `Obligatory for the elderly or chronically ill patients who cannot fast without severe hardship.`,
        `Measure per day: 1 Mudd (~750g staple food) or a full meal, totaling ${totalKg} kg for ${missedDays} days.`,
        'May be disbursed daily, or aggregated and given at the end of the month.'
      ]
    };
  }

  // Diyah (Blood Money)
  const fullDiyahGoldGrams = 4250; // 1000 gold dinars = 4.25 kg of 24k gold
  const estimatedDiyahCash = fullDiyahGoldGrams * goldPrice;
  return {
    category: 'diyah',
    titleAr: 'الدية الشرعية الكاملة (القتل الخطأ)',
    titleEn: 'Complete Shariah Diyah (Blood Money)',
    quranicRefAr: '﴿وَمَن قَتَلَ مُؤْمِنًا خَطَأً فَتَحْرِيرُ رَقَبَةٍ مُّؤْمِنَةٍ وَدِيَةٌ مُّسَلَّمَةٌ إِلَىٰ أَهْلِهِ﴾ [النساء: 92]',
    quranicRefEn: 'Quran: "And whoever kills a believer by mistake - then the freeing of a believing slave and a compensation payment presented to the deceased\'s family" [4:92]',
    primaryObligationAr: '100 من الإبل، أو 1000 دينار ذهباً (4.25 كجم ذهب خالص 24)',
    primaryObligationEn: '100 Camels, or 1000 Gold Dinars (4.25 kg 24k Gold), or 12,000 Silver Dirhams',
    foodQuantityKg: 0,
    mealsCount: 0,
    estimatedCost: estimatedDiyahCash,
    fastingAlternativeDays: 60, // Kaffarah for wrongful death: 60 consecutive days
    detailsAr: [
      `المعيار المعتمد في مجامع الفقه الإسلامي هو تقدير الدية بـ 4250 جراماً من الذهب الخالص عيار 24، وتقدر حالياً بنحو ${estimatedDiyahCash.toLocaleString()} ${params.currency || 'USD'}.`,
      'تتحمل الدية في القتل الخطأ وشبه العمد "العاقلة" (عصبة الجاني من القرابة الذكور) مؤجلة على ثلاث سنوات تخفيفاً.',
      'يلزم القاتل خطأً كفارة خاصة به وهي صيام شهرين متتابعين حقاً لله تعالى.'
    ],
    detailsEn: [
      `Recognized benchmark by Islamic Fiqh Academies: 4,250 grams of pure 24k gold, approximately ${estimatedDiyahCash.toLocaleString()} ${params.currency || 'USD'}.`,
      'In wrongful death, the compensation is borne by the agnates (\'Aqilah) paid over three installments over three years.',
      'The perpetrator must also personally fast 60 consecutive days as spiritual expiation to Allah.'
    ]
  };
}
