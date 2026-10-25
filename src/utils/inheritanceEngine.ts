import { InheritanceInput, InheritanceResult, HeirShareDetail, BlockedHeirDetail } from '../types';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function calculateInheritance(input: InheritanceInput): InheritanceResult {
  const gross = Math.max(0, Number(input.estateValue) || 0);
  const debts = Math.max(0, Number(input.debts) || 0);
  const funeral = Math.max(0, Number(input.funeralExpenses) || 0);
  
  const estateAfterDebts = Math.max(0, gross - debts - funeral);
  
  // Wasiyyah max is 1/3 of the net remaining
  const maxWasiyyah = estateAfterDebts / 3;
  const requestedWasiyyah = Math.max(0, Number(input.wasiyyah) || 0);
  const wasiyyah = Math.min(requestedWasiyyah, maxWasiyyah);
  
  const netEstate = Math.max(0, estateAfterDebts - wasiyyah);

  const heirs = input.heirs;
  const isMaleDeceased = input.deceasedGender === 'male';

  const sons = Number(heirs.sons) || 0;
  const daughters = Number(heirs.daughters) || 0;
  const grandsons = Number(heirs.grandsons) || 0;
  const granddaughters = Number(heirs.granddaughters) || 0;
  
  const hasMaleChild = sons > 0;
  const hasMaleDescendant = sons > 0 || grandsons > 0;
  const hasFemaleDescendant = daughters > 0 || granddaughters > 0;
  const hasDescendant = hasMaleDescendant || hasFemaleDescendant;

  const father = !!heirs.father;
  const mother = !!heirs.mother;
  const grandfather = !father && !!heirs.paternalGrandfather;
  const paternalGrandmother = !mother && !father && !!heirs.paternalGrandmother;
  const maternalGrandmother = !mother && !!heirs.maternalGrandmother;

  const fullBrothers = Number(heirs.fullBrothers) || 0;
  const fullSisters = Number(heirs.fullSisters) || 0;
  const paternalBrothers = Number(heirs.paternalBrothers) || 0;
  const paternalSisters = Number(heirs.paternalSisters) || 0;
  const maternalBrothers = Number(heirs.maternalBrothers) || 0;
  const maternalSisters = Number(heirs.maternalSisters) || 0;
  
  const totalSiblings = fullBrothers + fullSisters + paternalBrothers + paternalSisters + maternalBrothers + maternalSisters;

  const nephewsFull = Number(heirs.nephewsFull) || 0;
  const nephewsPaternal = Number(heirs.nephewsPaternal) || 0;
  const unclesFull = Number(heirs.unclesFull) || 0;
  const unclesPaternal = Number(heirs.unclesPaternal) || 0;
  const cousinsFull = Number(heirs.cousinsFull) || 0;
  const cousinsPaternal = Number(heirs.cousinsPaternal) || 0;

  const shares: HeirShareDetail[] = [];
  const blocked: BlockedHeirDetail[] = [];

  // Track fractions as numerator / denominator
  interface RawShare {
    heirKey: string;
    titleAr: string;
    titleEn: string;
    count: number;
    num: number;
    den: number;
    type: 'fard' | 'asabah' | 'fard_and_asabah';
    evidenceAr: string;
    evidenceEn: string;
    notesAr?: string;
    notesEn?: string;
  }

  const rawShares: RawShare[] = [];

  // 1. Spouses
  if (isMaleDeceased) {
    const wivesCount = Math.min(4, Math.max(0, Number(heirs.wives) || 0));
    if (wivesCount > 0) {
      if (hasDescendant) {
        rawShares.push({
          heirKey: 'wives',
          titleAr: wivesCount === 1 ? 'الزوجة' : `الزوجات (${wivesCount})`,
          titleEn: wivesCount === 1 ? 'Wife' : `Wives (${wivesCount})`,
          count: wivesCount,
          num: 1,
          den: 8,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم﴾ [النساء: 12]',
          evidenceEn: 'Quran: "But if you leave a child, then to them is an eighth of what you leave" [4:12]',
          notesAr: 'يشتركن في الثمن بالتساوي',
          notesEn: 'Shared equally among wives'
        });
      } else {
        rawShares.push({
          heirKey: 'wives',
          titleAr: wivesCount === 1 ? 'الزوجة' : `الزوجات (${wivesCount})`,
          titleEn: wivesCount === 1 ? 'Wife' : `Wives (${wivesCount})`,
          count: wivesCount,
          num: 1,
          den: 4,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ﴾ [النساء: 12]',
          evidenceEn: 'Quran: "And to them is half of what you leave if you leave no child" [4:12]',
          notesAr: 'يشتركن في الربع بالتساوي لعدم وجود فرع وارث',
          notesEn: 'Shared equally among wives due to absence of descendants'
        });
      }
    }
  } else {
    if (heirs.husband) {
      if (hasDescendant) {
        rawShares.push({
          heirKey: 'husband',
          titleAr: 'الزوج',
          titleEn: 'Husband',
          count: 1,
          num: 1,
          den: 4,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ﴾ [النساء: 12]',
          evidenceEn: 'Quran: "But if they leave a child, then for you is a fourth of what they leave" [4:12]'
        });
      } else {
        rawShares.push({
          heirKey: 'husband',
          titleAr: 'الزوج',
          titleEn: 'Husband',
          count: 1,
          num: 1,
          den: 2,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ﴾ [النساء: 12]',
          evidenceEn: 'Quran: "And for you is half of what your wives leave if they have no child" [4:12]'
        });
      }
    }
  }

  // 2. Mother
  if (mother) {
    if (hasDescendant || totalSiblings >= 2) {
      rawShares.push({
        heirKey: 'mother',
        titleAr: 'الأم',
        titleEn: 'Mother',
        count: 1,
        num: 1,
        den: 6,
        type: 'fard',
        evidenceAr: 'قوله تعالى: ﴿فَإِن كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ﴾ [النساء: 11]',
        evidenceEn: 'Quran: "And if he has brothers, for his mother is a sixth" [4:11]'
      });
    } else {
      // Check Gharrawayn case: Spouse + Mother + Father
      const isGharrawayn = (heirs.husband || (isMaleDeceased && (Number(heirs.wives) || 0) > 0)) && father && !hasDescendant && totalSiblings < 2;
      if (isGharrawayn) {
        // Mother gets 1/3 of the residue after spouse
        // If husband (1/2), residue is 1/2, mother gets 1/3 * 1/2 = 1/6
        // If wife (1/4), residue is 3/4, mother gets 1/3 * 3/4 = 1/4
        const mNum = heirs.husband ? 1 : 1;
        const mDen = heirs.husband ? 6 : 4;
        rawShares.push({
          heirKey: 'mother',
          titleAr: 'الأم (المسألة الغرّاوية/العمرية)',
          titleEn: 'Mother (Gharrawayn Case)',
          count: 1,
          num: mNum,
          den: mDen,
          type: 'fard',
          evidenceAr: 'قضاء عمر بن الخطاب وعثمان وابن مسعود وزيد بن ثابت رضي الله عنهم بثلث الباقي',
          evidenceEn: 'Verdict of the Rightly Guided Caliphs: 1/3 of the remainder after spouse share'
        });
      } else {
        rawShares.push({
          heirKey: 'mother',
          titleAr: 'الأم',
          titleEn: 'Mother',
          count: 1,
          num: 1,
          den: 3,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ﴾ [النساء: 11]',
          evidenceEn: 'Quran: "And if he had no child and the parents were his heirs, then for his mother is one third" [4:11]'
        });
      }
    }
  }

  // 3. Grandmothers (blocked if mother exists)
  if (mother) {
    if (heirs.paternalGrandmother) {
      blocked.push({
        heirKey: 'paternalGrandmother',
        titleAr: 'الجدة لأب',
        titleEn: 'Paternal Grandmother',
        count: 1,
        blockedByAr: 'الأم (حجب حرمان بالإجماع)',
        blockedByEn: 'Mother (Consensus Exclusion)'
      });
    }
    if (heirs.maternalGrandmother) {
      blocked.push({
        heirKey: 'maternalGrandmother',
        titleAr: 'الجدة لأم',
        titleEn: 'Maternal Grandmother',
        count: 1,
        blockedByAr: 'الأم (حجب حرمان بالإجماع)',
        blockedByEn: 'Mother (Consensus Exclusion)'
      });
    }
  } else {
    // Check father blocking paternal grandmother
    if (father && heirs.paternalGrandmother) {
      blocked.push({
        heirKey: 'paternalGrandmother',
        titleAr: 'الجدة لأب',
        titleEn: 'Paternal Grandmother',
        count: 1,
        blockedByAr: 'الأب (تحجب به عند الجمهور)',
        blockedByEn: 'Father (Excluded by Father)'
      });
    }
    const eligibleGrandmothers = (maternalGrandmother ? 1 : 0) + (paternalGrandmother ? 1 : 0);
    if (eligibleGrandmothers > 0) {
      rawShares.push({
        heirKey: 'grandmothers',
        titleAr: eligibleGrandmothers === 2 ? 'الجدتان (لأب ولأم)' : (maternalGrandmother ? 'الجدة لأم' : 'الجدة لأب'),
        titleEn: eligibleGrandmothers === 2 ? 'Both Grandmothers' : 'Grandmother',
        count: eligibleGrandmothers,
        num: 1,
        den: 6,
        type: 'fard',
        evidenceAr: 'قضى النبي ﷺ للجدة بالسدس (أخرجه أبو داود والترمذي)',
        evidenceEn: 'Hadith: The Prophet ﷺ allotted one-sixth to the grandmother',
        notesAr: eligibleGrandmothers === 2 ? 'يشتركن في السدس بالسوية' : undefined,
        notesEn: eligibleGrandmothers === 2 ? 'Shared equally between both' : undefined
      });
    }
  }

  // 4. Father & Grandfather
  let fatherTakesFard = false;
  if (father) {
    if (hasMaleDescendant) {
      // 1/6 only
      rawShares.push({
        heirKey: 'father',
        titleAr: 'الأب',
        titleEn: 'Father',
        count: 1,
        num: 1,
        den: 6,
        type: 'fard',
        evidenceAr: 'قوله تعالى: ﴿وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ﴾ [النساء: 11]',
        evidenceEn: 'Quran: "And for one\'s parents, to each one of them is a sixth of what he left if he had a child" [4:11]'
      });
      fatherTakesFard = true;
    } else if (hasFemaleDescendant) {
      // 1/6 fard + Asabah
      rawShares.push({
        heirKey: 'father',
        titleAr: 'الأب',
        titleEn: 'Father',
        count: 1,
        num: 1,
        den: 6,
        type: 'fard_and_asabah',
        evidenceAr: 'السدس فرضاً لوجود الفرع الوارث المؤنث + الباقي تعصيباً إن وُجد',
        evidenceEn: '1/6 as fixed share plus residuary remainder if any'
      });
      fatherTakesFard = true;
    }
  } else if (grandfather) {
    if (hasMaleDescendant) {
      rawShares.push({
        heirKey: 'grandfather',
        titleAr: 'الجد لأب',
        titleEn: 'Paternal Grandfather',
        count: 1,
        num: 1,
        den: 6,
        type: 'fard',
        evidenceAr: 'يقوم الجد مقام الأب عند عدمه وله السدس مع الفرع الوارث المذكر',
        evidenceEn: 'Takes father\'s place in father\'s absence: 1/6 with male descendant'
      });
      fatherTakesFard = true;
    } else if (hasFemaleDescendant) {
      rawShares.push({
        heirKey: 'grandfather',
        titleAr: 'الجد لأب',
        titleEn: 'Paternal Grandfather',
        count: 1,
        num: 1,
        den: 6,
        type: 'fard_and_asabah',
        evidenceAr: 'السدس فرضاً + الباقي تعصيباً لقيامه مقام الأب مع الفرع المؤنث',
        evidenceEn: '1/6 fixed share + residue as residuary with female descendant'
      });
      fatherTakesFard = true;
    }
  }

  // 5. Daughters & Sons
  let daughtersHandledAsabah = false;
  if (sons > 0) {
    // Sons are Asabah bin-Nafs. If daughters exist, daughters are Asabah bil-Ghayr (2:1 ratio)
    daughtersHandledAsabah = true;
  } else if (daughters > 0) {
    if (daughters === 1) {
      rawShares.push({
        heirKey: 'daughters',
        titleAr: 'البنت',
        titleEn: 'Daughter (Single)',
        count: 1,
        num: 1,
        den: 2,
        type: 'fard',
        evidenceAr: 'قوله تعالى: ﴿وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ﴾ [النساء: 11]',
        evidenceEn: 'Quran: "And if there is only one, then for her is half" [4:11]'
      });
    } else {
      rawShares.push({
        heirKey: 'daughters',
        titleAr: `البنات (${daughters})`,
        titleEn: `Daughters (${daughters})`,
        count: daughters,
        num: 2,
        den: 3,
        type: 'fard',
        evidenceAr: 'قوله تعالى: ﴿فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ﴾ [النساء: 11]',
        evidenceEn: 'Quran: "If there are women more than two, for them is two thirds of what he left" [4:11]',
        notesAr: 'يشتركن في الثلثين بالسوية',
        notesEn: 'Shared equally between daughters'
      });
    }
  }

  // 6. Granddaughters (bint ibn)
  if (sons > 0) {
    if (granddaughters > 0) {
      blocked.push({
        heirKey: 'granddaughters',
        titleAr: 'بنات الابن',
        titleEn: 'Granddaughters',
        count: granddaughters,
        blockedByAr: 'الابن المباشر (حجب حرمان بالإجماع)',
        blockedByEn: 'Direct Son(s)'
      });
    }
    if (grandsons > 0) {
      blocked.push({
        heirKey: 'grandsons',
        titleAr: 'أبناء الابن',
        titleEn: 'Grandsons',
        count: grandsons,
        blockedByAr: 'الابن المباشر (حجب حرمان بالإجماع)',
        blockedByEn: 'Direct Son(s)'
      });
    }
  } else if (daughters >= 2 && grandsons === 0 && granddaughters > 0) {
    blocked.push({
      heirKey: 'granddaughters',
      titleAr: 'بنات الابن',
      titleEn: 'Granddaughters',
      count: granddaughters,
      blockedByAr: 'استيفاء البنات للثلثين مع عدم وجود معصّب (ابن ابن مساوٍ)',
      blockedByEn: 'Two or more daughters exhausted the 2/3 share without a male counterpart'
    });
  } else if (daughters === 1 && grandsons === 0 && granddaughters > 0) {
    rawShares.push({
      heirKey: 'granddaughters',
      titleAr: `بنات الابن (${granddaughters})`,
      titleEn: `Granddaughters (${granddaughters})`,
      count: granddaughters,
      num: 1,
      den: 6,
      type: 'fard',
      evidenceAr: 'قضى النبي ﷺ لابنة الابن بالسدس تكملة للثلثين مع البنت الصلبية',
      evidenceEn: 'Hadith: Prophet ﷺ decreed 1/6 for granddaughter completing 2/3 with daughter'
    });
  }

  // 7. Maternal Siblings (Akh/Ukht lil-Umm)
  // Blocked by any descendant (male or female) or any male ascendant (father or grandfather)
  const isMaternalBlocked = hasDescendant || father || grandfather;
  const maternalCount = maternalBrothers + maternalSisters;
  if (maternalCount > 0) {
    if (isMaternalBlocked) {
      blocked.push({
        heirKey: 'maternalSiblings',
        titleAr: 'الإخوة والأخوات لأم',
        titleEn: 'Maternal Siblings',
        count: maternalCount,
        blockedByAr: hasDescendant ? 'وجود الفرع الوارث' : 'وجود الأصل المذكر (الأب/الجد)',
        blockedByEn: hasDescendant ? 'Descendants' : 'Male Ascendants (Father/Grandfather)'
      });
    } else {
      if (maternalCount === 1) {
        rawShares.push({
          heirKey: 'maternalSiblings',
          titleAr: maternalBrothers > 0 ? 'الأخ لأم' : 'الأخت لأم',
          titleEn: 'Maternal Sibling (Single)',
          count: 1,
          num: 1,
          den: 6,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ﴾ [النساء: 12]',
          evidenceEn: 'Quran: "And if a man or woman leaves neither ascendants nor descendants, but has a brother or a sister, then for each one is a sixth" [4:12]'
        });
      } else {
        rawShares.push({
          heirKey: 'maternalSiblings',
          titleAr: `الإخوة والأخوات لأم (${maternalCount})`,
          titleEn: `Maternal Siblings (${maternalCount})`,
          count: maternalCount,
          num: 1,
          den: 3,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿فَإِن كَانُوا أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ﴾ [النساء: 12]',
          evidenceEn: 'Quran: "But if they are more than that, they share a third" [4:12]',
          notesAr: 'يقتسمون الثلث بالسوية بين الذكر والأنثى بالتساوي',
          notesEn: 'Shared equally between males and females without 2:1 rule'
        });
      }
    }
  }

  // 8. Full Sisters (if not blocked)
  const isSiblingsBlocked = hasMaleDescendant || father;
  if (fullBrothers > 0 && isSiblingsBlocked) {
    blocked.push({
      heirKey: 'fullBrothers',
      titleAr: 'الإخوة الأشقاء',
      titleEn: 'Full Brothers',
      count: fullBrothers,
      blockedByAr: hasMaleDescendant ? 'وجود الابن/ابن الابن' : 'وجود الأب بالإجماع',
      blockedByEn: hasMaleDescendant ? 'Male Descendants' : 'Father'
    });
  }
  if (fullSisters > 0 && isSiblingsBlocked) {
    blocked.push({
      heirKey: 'fullSisters',
      titleAr: 'الأخوات الشقيقات',
      titleEn: 'Full Sisters',
      count: fullSisters,
      blockedByAr: hasMaleDescendant ? 'وجود الابن/ابن الابن' : 'وجود الأب بالإجماع',
      blockedByEn: hasMaleDescendant ? 'Male Descendants' : 'Father'
    });
  }

  // If sisters are not blocked and no full brothers, do they have fixed share?
  if (!isSiblingsBlocked && fullBrothers === 0 && fullSisters > 0) {
    if (!hasFemaleDescendant) {
      if (fullSisters === 1) {
        rawShares.push({
          heirKey: 'fullSisters',
          titleAr: 'الأخت الشقيقة',
          titleEn: 'Full Sister (Single)',
          count: 1,
          num: 1,
          den: 2,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ﴾ [النساء: 176]',
          evidenceEn: 'Quran: "If a man dies leaving no child but has a sister, she shall have half of what he leaves" [4:176]'
        });
      } else {
        rawShares.push({
          heirKey: 'fullSisters',
          titleAr: `الأخوات الشقيقات (${fullSisters})`,
          titleEn: `Full Sisters (${fullSisters})`,
          count: fullSisters,
          num: 2,
          den: 3,
          type: 'fard',
          evidenceAr: 'قوله تعالى: ﴿فَإِن كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ﴾ [النساء: 176]',
          evidenceEn: 'Quran: "If there are two, then they have two thirds of what he leaves" [4:176]'
        });
      }
    } else {
      // Full sisters with daughters become Asabah ma'a al-Ghayr ("اجعلوا الأخوات مع البنات عصبة")
    }
  }

  // Calculate Base Denominator (LCM of all denominators of Quranic Sharers)
  const denominators = rawShares.map(s => s.den);
  const baseDenominator = denominators.length > 0 ? denominators.reduce((acc, curr) => lcm(acc, curr), 1) : 1;

  // Convert each fard share to share points based on baseDenominator
  let totalAllocatedPoints = 0;
  rawShares.forEach(s => {
    const points = (baseDenominator / s.den) * s.num;
    totalAllocatedPoints += points;
  });

  // Check Asabah (Residuaries)
  let asabahKey: string | null = null;
  let asabahTitleAr = '';
  let asabahTitleEn = '';
  let asabahCount = 0;
  let asabahSharesUnits = 0; // Male counts as 2, female as 1 if combined
  let maleUnits = 0;
  let femaleUnits = 0;
  let asabahEvidenceAr = '';
  let asabahEvidenceEn = '';

  // Determine Asabah priority:
  // 1. Sons & Daughters (bil-Ghayr)
  if (sons > 0) {
    asabahKey = 'children_asabah';
    asabahTitleAr = daughters > 0 ? `الأبناء (${sons}) والبنات (${daughters}) عصبة بالغير` : `الأبناء الذكور (${sons}) عصبة بالنفس`;
    asabahTitleEn = daughters > 0 ? `Sons (${sons}) & Daughters (${daughters}) Residuaries` : `Sons (${sons}) Agnatic Residuaries`;
    asabahCount = sons + daughters;
    maleUnits = sons;
    femaleUnits = daughters;
    asabahSharesUnits = sons * 2 + daughters;
    asabahEvidenceAr = 'قوله تعالى: ﴿يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ﴾ [النساء: 11]، وحديث: «ألحقوا الفرائض بأهلها، فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Quran: "Allah instructs you concerning your children: for the male, what is equal to the share of two females" [4:11]';
  }
  // 2. Grandsons & Granddaughters (if no direct sons)
  else if (grandsons > 0) {
    asabahKey = 'grandchildren_asabah';
    asabahTitleAr = granddaughters > 0 ? `أبناء الابن (${grandsons}) وبنات الابن (${granddaughters}) عصبة بالغير` : `أبناء الابن (${grandsons}) عصبة بالنفس`;
    asabahTitleEn = granddaughters > 0 ? `Grandsons (${grandsons}) & Granddaughters (${granddaughters}) Residuaries` : `Grandsons (${grandsons}) Residuaries`;
    asabahCount = grandsons + granddaughters;
    maleUnits = grandsons;
    femaleUnits = granddaughters;
    asabahSharesUnits = grandsons * 2 + granddaughters;
    asabahEvidenceAr = 'يقوم ابن الابن مقام الابن عند عدمه، وحديث: «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Son\'s sons step into the son\'s place in his absence as agnatic residuaries';
  }
  // 3. Father (pure Asabah if no descendants)
  else if (father && !hasDescendant) {
    asabahKey = 'father_asabah';
    asabahTitleAr = 'الأب (عصبة بالنفس)';
    asabahTitleEn = 'Father (Agnatic Residuary)';
    asabahCount = 1;
    maleUnits = 1;
    asabahSharesUnits = 1;
    asabahEvidenceAr = 'عصبة بالنفس لعدم وجود فرع وارث: «فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Residuary by self due to absence of descendants';
  }
  // 4. Grandfather (pure Asabah if no father and no descendants)
  else if (grandfather && !hasDescendant) {
    asabahKey = 'grandfather_asabah';
    asabahTitleAr = 'الجد لأب (عصبة بالنفس)';
    asabahTitleEn = 'Grandfather (Agnatic Residuary)';
    asabahCount = 1;
    maleUnits = 1;
    asabahSharesUnits = 1;
    asabahEvidenceAr = 'يقوم مقام الأب في التعصيب عند عدمه';
    asabahEvidenceEn = 'Stands in place of father as residuary in his absence';
  }
  // 5. Full Brothers (and Full Sisters with them)
  else if (!isSiblingsBlocked && (fullBrothers > 0 || (fullSisters > 0 && hasFemaleDescendant))) {
    if (fullBrothers > 0) {
      asabahKey = 'full_siblings_asabah';
      asabahTitleAr = fullSisters > 0 ? `الإخوة الأشقاء (${fullBrothers}) والشقيقات (${fullSisters}) عصبة بالغير` : `الإخوة الأشقاء (${fullBrothers}) عصبة بالنفس`;
      asabahTitleEn = fullSisters > 0 ? `Full Brothers (${fullBrothers}) & Sisters (${fullSisters}) Residuaries` : `Full Brothers (${fullBrothers}) Residuaries`;
      asabahCount = fullBrothers + fullSisters;
      maleUnits = fullBrothers;
      femaleUnits = fullSisters;
      asabahSharesUnits = fullBrothers * 2 + fullSisters;
      asabahEvidenceAr = 'قوله تعالى: ﴿وَإِن كَانُوا إِخْوَةً رِّجَالًا وَنِسَاءً فَلِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ﴾ [النساء: 176]';
      asabahEvidenceEn = 'Quran: "If there are siblings, both men and women, the male will have double the share of the female" [4:176]';
    } else {
      // Full sisters with daughters become Asabah ma'a al-Ghayr
      asabahKey = 'full_sisters_asabah_maa_ghayr';
      asabahTitleAr = `الأخوات الشقيقات (${fullSisters}) عصبة مع الغير (مع البنات)`;
      asabahTitleEn = `Full Sisters (${fullSisters}) Residuary with Daughters`;
      asabahCount = fullSisters;
      femaleUnits = fullSisters;
      asabahSharesUnits = fullSisters;
      asabahEvidenceAr = 'قضاء الصحابة: «اجعلوا الأخوات مع البنات عصبة» (رواه البخاري)';
      asabahEvidenceEn = 'Hadith: "Make sisters with daughters residuaries" (Sahih al-Bukhari)';
    }
  }
  // 6. Paternal Brothers / Sisters
  else if (!isSiblingsBlocked && fullBrothers === 0 && fullSisters === 0 && (paternalBrothers > 0 || (paternalSisters > 0 && hasFemaleDescendant))) {
    if (paternalBrothers > 0) {
      asabahKey = 'paternal_siblings_asabah';
      asabahTitleAr = paternalSisters > 0 ? `الإخوة لأب (${paternalBrothers}) والأخوات لأب (${paternalSisters}) عصبة بالغير` : `الإخوة لأب (${paternalBrothers}) عصبة بالنفس`;
      asabahTitleEn = `Paternal Siblings Residuaries`;
      asabahCount = paternalBrothers + paternalSisters;
      maleUnits = paternalBrothers;
      femaleUnits = paternalSisters;
      asabahSharesUnits = paternalBrothers * 2 + paternalSisters;
      asabahEvidenceAr = 'عصبة بالغير عند عدم الأشقاء، للذكر مثل حظ الأنثيين';
      asabahEvidenceEn = 'Agnatic residuaries in absence of full siblings';
    } else {
      asabahKey = 'paternal_sisters_asabah_maa_ghayr';
      asabahTitleAr = `الأخوات لأب (${paternalSisters}) عصبة مع الغير (مع البنات)`;
      asabahTitleEn = `Paternal Sisters (${paternalSisters}) Residuary with Daughters`;
      asabahCount = paternalSisters;
      femaleUnits = paternalSisters;
      asabahSharesUnits = paternalSisters;
      asabahEvidenceAr = 'يقمن مقام الشقيقات عند عدمهن: «اجعلوا الأخوات مع البنات عصبة»';
      asabahEvidenceEn = 'Takes the place of full sisters as residuaries with daughters';
    }
  }
  // 7. Nephews (Full brother's sons)
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull > 0) {
    asabahKey = 'nephews_full_asabah';
    asabahTitleAr = `أبناء الأخ الشقيق (${nephewsFull}) عصبة بالنفس`;
    asabahTitleEn = `Full Nephews (${nephewsFull}) Residuaries`;
    asabahCount = nephewsFull;
    maleUnits = nephewsFull;
    asabahSharesUnits = nephewsFull;
    asabahEvidenceAr = 'حديث: «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Nearest male agnate inherits remainder';
  }
  // 8. Nephews Paternal
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull === 0 && nephewsPaternal > 0) {
    asabahKey = 'nephews_paternal_asabah';
    asabahTitleAr = `أبناء الأخ لأب (${nephewsPaternal}) عصبة بالنفس`;
    asabahTitleEn = `Paternal Nephews (${nephewsPaternal}) Residuaries`;
    asabahCount = nephewsPaternal;
    maleUnits = nephewsPaternal;
    asabahSharesUnits = nephewsPaternal;
    asabahEvidenceAr = 'حديث: «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Nearest male agnate inherits remainder';
  }
  // 9. Full Uncles
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull === 0 && nephewsPaternal === 0 && unclesFull > 0) {
    asabahKey = 'uncles_full_asabah';
    asabahTitleAr = `العم الشقيق (${unclesFull}) عصبة بالنفس`;
    asabahTitleEn = `Full Paternal Uncle (${unclesFull}) Residuary`;
    asabahCount = unclesFull;
    maleUnits = unclesFull;
    asabahSharesUnits = unclesFull;
    asabahEvidenceAr = 'حديث: «ألحقوا الفرائض بأهلها فما بقي فلأولى رجل ذكر»';
    asabahEvidenceEn = 'Nearest male agnate inherits remainder';
  }
  // 10. Paternal Uncles
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull === 0 && nephewsPaternal === 0 && unclesFull === 0 && unclesPaternal > 0) {
    asabahKey = 'uncles_paternal_asabah';
    asabahTitleAr = `العم لأب (${unclesPaternal}) عصبة بالنفس`;
    asabahTitleEn = `Paternal Uncle (${unclesPaternal}) Residuary`;
    asabahCount = unclesPaternal;
    maleUnits = unclesPaternal;
    asabahSharesUnits = unclesPaternal;
    asabahEvidenceAr = 'عصبة بالنفس عند عدم من هو أقرب';
    asabahEvidenceEn = 'Residuary in absence of closer relatives';
  }
  // 11. Full Cousins
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull === 0 && unclesFull === 0 && unclesPaternal === 0 && cousinsFull > 0) {
    asabahKey = 'cousins_full_asabah';
    asabahTitleAr = `ابن العم الشقيق (${cousinsFull}) عصبة بالنفس`;
    asabahTitleEn = `Full Cousin (${cousinsFull}) Residuary`;
    asabahCount = cousinsFull;
    maleUnits = cousinsFull;
    asabahSharesUnits = cousinsFull;
    asabahEvidenceAr = 'عصبة بالنفس';
    asabahEvidenceEn = 'Residuary by self';
  }
  // 12. Paternal Cousins
  else if (!isSiblingsBlocked && fullBrothers === 0 && nephewsFull === 0 && unclesFull === 0 && unclesPaternal === 0 && cousinsFull === 0 && cousinsPaternal > 0) {
    asabahKey = 'cousins_paternal_asabah';
    asabahTitleAr = `ابن العم لأب (${cousinsPaternal}) عصبة بالنفس`;
    asabahTitleEn = `Paternal Cousin (${cousinsPaternal}) Residuary`;
    asabahCount = cousinsPaternal;
    maleUnits = cousinsPaternal;
    asabahSharesUnits = cousinsPaternal;
    asabahEvidenceAr = 'عصبة بالنفس';
    asabahEvidenceEn = 'Residuary by self';
  }

  // Handle remaining residue if father or grandfather took 1/6 + Asabah
  const fatherTookCombined = (father || grandfather) && !hasMaleDescendant && hasFemaleDescendant;

  let adjustmentType: 'none' | 'awl' | 'radd' = 'none';
  let adjustedDenominator = baseDenominator;

  // Case A: Awl (Total allocated points > baseDenominator)
  if (totalAllocatedPoints > baseDenominator) {
    adjustmentType = 'awl';
    adjustedDenominator = totalAllocatedPoints;

    rawShares.forEach(s => {
      const sharePoints = (baseDenominator / s.den) * s.num;
      const shareDecimal = sharePoints / adjustedDenominator;
      const sharePercent = shareDecimal * 100;
      const totalAmount = shareDecimal * netEstate;
      const amountPerHeir = totalAmount / s.count;

      shares.push({
        heirKey: s.heirKey,
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        count: s.count,
        shareFraction: `${sharePoints}/${adjustedDenominator}`,
        shareDecimal,
        sharePercent,
        totalAmount,
        amountPerHeir,
        shareType: s.type,
        evidenceAr: s.evidenceAr,
        evidenceEn: s.evidenceEn,
        notesAr: s.notesAr ? `${s.notesAr} (عالت المسألة من ${baseDenominator} إلى ${adjustedDenominator})` : `عالت المسألة من ${baseDenominator} إلى ${adjustedDenominator}`,
        notesEn: s.notesEn ? `${s.notesEn} ('Awl deficit: denominator increased from ${baseDenominator} to ${adjustedDenominator})` : `'Awl deficit adjustment: base ${baseDenominator} -> ${adjustedDenominator}`
      });
    });
  }
  // Case B: Exactly equal (totalAllocatedPoints === baseDenominator)
  else if (totalAllocatedPoints === baseDenominator && !asabahKey && !fatherTookCombined) {
    rawShares.forEach(s => {
      const sharePoints = (baseDenominator / s.den) * s.num;
      const shareDecimal = sharePoints / baseDenominator;
      const sharePercent = shareDecimal * 100;
      const totalAmount = shareDecimal * netEstate;
      const amountPerHeir = totalAmount / s.count;

      shares.push({
        heirKey: s.heirKey,
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        count: s.count,
        shareFraction: `${s.num}/${s.den}`,
        shareDecimal,
        sharePercent,
        totalAmount,
        amountPerHeir,
        shareType: s.type,
        evidenceAr: s.evidenceAr,
        evidenceEn: s.evidenceEn,
        notesAr: s.notesAr,
        notesEn: s.notesEn
      });
    });
  }
  // Case C: Surplus exists (totalAllocatedPoints < baseDenominator)
  else {
    const remainingPoints = baseDenominator - totalAllocatedPoints;
    
    // Subcase C1: There is an Asabah heir to take the residue
    if (asabahKey || fatherTookCombined) {
      // First allocate fard shares
      rawShares.forEach(s => {
        // If father/grandfather had fard_and_asabah, his fard portion goes here, residue added below
        const sharePoints = (baseDenominator / s.den) * s.num;
        const shareDecimal = sharePoints / baseDenominator;
        const sharePercent = shareDecimal * 100;
        const totalAmount = shareDecimal * netEstate;
        const amountPerHeir = totalAmount / s.count;

        shares.push({
          heirKey: s.heirKey,
          titleAr: s.titleAr,
          titleEn: s.titleEn,
          count: s.count,
          shareFraction: `${s.num}/${s.den}`,
          shareDecimal,
          sharePercent,
          totalAmount,
          amountPerHeir,
          shareType: s.type,
          evidenceAr: s.evidenceAr,
          evidenceEn: s.evidenceEn,
          notesAr: s.notesAr,
          notesEn: s.notesEn
        });
      });

      // Now allocate the residue to Asabah
      if (fatherTookCombined && !asabahKey) {
        // Residue goes to father/grandfather
        const residueAmount = (remainingPoints / baseDenominator) * netEstate;
        const targetShare = shares.find(s => s.heirKey === (father ? 'father' : 'grandfather'));
        if (targetShare) {
          targetShare.totalAmount += residueAmount;
          targetShare.amountPerHeir = targetShare.totalAmount;
          targetShare.shareDecimal = targetShare.totalAmount / (netEstate || 1);
          targetShare.sharePercent = targetShare.shareDecimal * 100;
          targetShare.notesAr = `السدس فرضاً (${baseDenominator / 6}/${baseDenominator}) + الباقي تعصيباً (${remainingPoints}/${baseDenominator})`;
          targetShare.notesEn = `1/6 fixed + ${remainingPoints}/${baseDenominator} as residuary`;
        }
      } else if (asabahKey) {
        const residueAmount = (remainingPoints / baseDenominator) * netEstate;
        const residueDecimal = remainingPoints / baseDenominator;
        const residuePercent = residueDecimal * 100;

        // If children asabah with sons & daughters (2:1 ratio)
        if (asabahKey === 'children_asabah' && daughters > 0 && sons > 0) {
          const unitValue = residueAmount / asabahSharesUnits;
          const sonsTotal = sons * 2 * unitValue;
          const daughtersTotal = daughters * unitValue;

          shares.push({
            heirKey: 'sons',
            titleAr: `الأبناء الذكور (${sons})`,
            titleEn: `Sons (${sons})`,
            count: sons,
            shareFraction: `عصبة (${sons * 2}/${asabahSharesUnits} من الباقي)`,
            shareDecimal: sonsTotal / (netEstate || 1),
            sharePercent: (sonsTotal / (netEstate || 1)) * 100,
            totalAmount: sonsTotal,
            amountPerHeir: sonsTotal / sons,
            shareType: 'asabah',
            evidenceAr: asabahEvidenceAr,
            evidenceEn: asabahEvidenceEn,
            notesAr: 'عصبة بالغير: للذكر مثل حظ الأنثيين',
            notesEn: 'Residuary: Male receives double the female share'
          });

          shares.push({
            heirKey: 'daughters_asabah',
            titleAr: `البنات (${daughters})`,
            titleEn: `Daughters (${daughters})`,
            count: daughters,
            shareFraction: `عصبة (${daughters}/${asabahSharesUnits} من الباقي)`,
            shareDecimal: daughtersTotal / (netEstate || 1),
            sharePercent: (daughtersTotal / (netEstate || 1)) * 100,
            totalAmount: daughtersTotal,
            amountPerHeir: daughtersTotal / daughters,
            shareType: 'asabah',
            evidenceAr: asabahEvidenceAr,
            evidenceEn: asabahEvidenceEn,
            notesAr: 'عصبة بالغير مع الأبناء',
            notesEn: 'Residuary alongside brothers'
          });
        } else {
          shares.push({
            heirKey: asabahKey,
            titleAr: asabahTitleAr,
            titleEn: asabahTitleEn,
            count: asabahCount,
            shareFraction: `${remainingPoints}/${baseDenominator} (الباقي تعصيباً)`,
            shareDecimal: residueDecimal,
            sharePercent: residuePercent,
            totalAmount: residueAmount,
            amountPerHeir: residueAmount / (asabahCount || 1),
            shareType: 'asabah',
            evidenceAr: asabahEvidenceAr,
            evidenceEn: asabahEvidenceEn,
            notesAr: 'يأخذ ما بقي بعد أصحاب الفروض',
            notesEn: 'Inherits the entire remaining estate after Quranic shares'
          });
        }
      }
    }
    // Subcase C2: Radd (Redistribution of surplus)
    else {
      // According to majority view (and modern personal status laws),
      // surplus is redistributed to Quranic sharers in proportion to their shares.
      // (Spouses excluded from Radd unless no other Quranic heirs exist).
      const nonSpouseShares = rawShares.filter(s => s.heirKey !== 'husband' && s.heirKey !== 'wives');
      
      if (nonSpouseShares.length > 0) {
        adjustmentType = 'radd';
        // Spouse gets their fixed fraction from net estate first
        const spouseShare = rawShares.find(s => s.heirKey === 'husband' || s.heirKey === 'wives');
        let spouseAmount = 0;
        if (spouseShare) {
          const spPoints = (baseDenominator / spouseShare.den) * spouseShare.num;
          spouseAmount = (spPoints / baseDenominator) * netEstate;
          shares.push({
            heirKey: spouseShare.heirKey,
            titleAr: spouseShare.titleAr,
            titleEn: spouseShare.titleEn,
            count: spouseShare.count,
            shareFraction: `${spouseShare.num}/${spouseShare.den}`,
            shareDecimal: spouseAmount / (netEstate || 1),
            sharePercent: (spouseAmount / (netEstate || 1)) * 100,
            totalAmount: spouseAmount,
            amountPerHeir: spouseAmount / spouseShare.count,
            shareType: spouseShare.type,
            evidenceAr: spouseShare.evidenceAr,
            evidenceEn: spouseShare.evidenceEn,
            notesAr: 'فرض مقدر (لا يرد على الزوجين مع وجود أصحاب فروض آخرين عند جمهور الفقهاء)',
            notesEn: 'Fixed share (Spouse does not participate in Radd surplus when other heirs exist)'
          });
        }

        const estateForRadd = netEstate - spouseAmount;
        const totalRaddPoints = nonSpouseShares.reduce((acc, curr) => acc + (baseDenominator / curr.den) * curr.num, 0);

        nonSpouseShares.forEach(s => {
          const points = (baseDenominator / s.den) * s.num;
          const raddShareFraction = points / totalRaddPoints;
          const totalAmount = raddShareFraction * estateForRadd;
          const amountPerHeir = totalAmount / s.count;

          shares.push({
            heirKey: s.heirKey,
            titleAr: s.titleAr,
            titleEn: s.titleEn,
            count: s.count,
            shareFraction: `${points}/${totalRaddPoints} (فرضاً ورداً)`,
            shareDecimal: totalAmount / (netEstate || 1),
            sharePercent: (totalAmount / (netEstate || 1)) * 100,
            totalAmount,
            amountPerHeir,
            shareType: s.type,
            evidenceAr: `${s.evidenceAr} + الرد لعدم وجود عاصب (قول علي وعثمان رضي الله عنهما)`,
            evidenceEn: `${s.evidenceEn} + Radd redistribution due to absence of residuaries`,
            notesAr: 'فائض التركة رُد على أصحاب الفروض بنسبة أنصبتهم',
            notesEn: 'Surplus redistributed proportionately among Quranic sharers'
          });
        });
      } else {
        // Only spouse exists: modern laws and some classical scholars give spouse the whole estate by Radd
        const onlySpouse = rawShares[0];
        if (onlySpouse) {
          shares.push({
            heirKey: onlySpouse.heirKey,
            titleAr: onlySpouse.titleAr,
            titleEn: onlySpouse.titleEn,
            count: onlySpouse.count,
            shareFraction: '1/1 (فرضاً ورداً)',
            shareDecimal: 1,
            sharePercent: 100,
            totalAmount: netEstate,
            amountPerHeir: netEstate / onlySpouse.count,
            shareType: onlySpouse.type,
            evidenceAr: 'تأخذ الفرض المقدر + باقي التركة بالرد لعدم وجود أي وارث آخر',
            evidenceEn: 'Takes fixed share + full remainder via Radd in absence of any other heirs'
          });
        }
      }
    }
  }

  // Calculate total distributed
  const totalDistributed = shares.reduce((acc, s) => acc + s.totalAmount, 0);
  const remainingEstate = Math.max(0, netEstate - totalDistributed);

  return {
    grossEstate: gross,
    debts,
    funeralExpenses: funeral,
    wasiyyah,
    netEstate,
    baseDenominator,
    adjustedDenominator,
    adjustmentType,
    heirsShares: shares,
    blockedHeirs: blocked,
    totalDistributed,
    remainingEstate
  };
}
