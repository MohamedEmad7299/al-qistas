import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { Download, Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  modalData: any;
}

export const PdfExportModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  language,
  modalData,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const t = translations[language];

  if (!isOpen || !modalData) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    const filename = `Al-Qistas-${modalData.type}-${new Date().toISOString().split('T')[0]}`;
    await exportElementToPdf('pdf-printable-certificate', filename, 'portrait');
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateGreg = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#09261e] border-2 border-[#c8a951] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#07261d] border-b border-[#c8a951]/30">
          <div className="flex items-center gap-2 text-[#f3e5ab] font-amiri text-lg font-bold">
            <Sparkles className="w-5 h-5 text-[#c8a951]" />
            <span>{language === 'ar' ? 'معاينة التقرير الشرعي للطباعة و PDF' : 'Official PDF Document Preview'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b3d2e] border border-[#c8a951]/30 text-white text-xs font-semibold hover:bg-[#114d3a] transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#c8a951]" />
              <span>{t.print}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold hover:brightness-110 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? (language === 'ar' ? 'جارٍ المعالجة...' : 'Generating...') : t.downloadReport}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#07261d] text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Certificate Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-900/50 flex justify-center">
          {/* Printable Document Container (Styled like a Royal Islamic Certificate) */}
          <div
            id="pdf-printable-certificate"
            className="w-full max-w-2xl bg-[#ffffff] text-[#1a202c] p-8 md:p-12 shadow-2xl relative border-8 border-double border-[#0f3d2e] rounded-sm font-sans"
            style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
          >
            {/* Islamic Ornate Border Inset */}
            <div className="border border-[#c8a951] p-6 relative">
              {/* Corner Ornaments */}
              <span className="absolute -top-3 -left-3 text-[#c8a951] font-amiri text-xl">۞</span>
              <span className="absolute -top-3 -right-3 text-[#c8a951] font-amiri text-xl">۞</span>
              <span className="absolute -bottom-3 -left-3 text-[#c8a951] font-amiri text-xl">۞</span>
              <span className="absolute -bottom-3 -right-3 text-[#c8a951] font-amiri text-xl">۞</span>

              {/* Bismillah */}
              <div className="text-center mb-4">
                <span className="font-amiri text-2xl md:text-3xl font-bold text-[#0f3d2e] tracking-wide block">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="text-[11px] text-[#c8a951] font-amiri block mt-1">
                  «وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ذَٰلِكَ خَيْرٌ وَأَحْسَنُ تَأْوِيلًا»
                </span>
              </div>

              {/* Title & Badge */}
              <div className="text-center border-b-2 border-[#0f3d2e]/20 pb-4 mb-6">
                <h1 className="font-amiri text-2xl md:text-3xl font-bold text-[#0f3d2e]">
                  {modalData.type === 'inheritance' && (language === 'ar' ? 'حَصْرُ إِرْثٍ وَتَوْزِيعُ تَرِكَةٍ شَرْعِيٌّ' : 'Official Estate Distribution Certificate')}
                  {modalData.type === 'zakat' && (language === 'ar' ? 'بَيَانُ حِسَابِ الزَّكَاةِ الشَّرْعِيَّةِ' : 'Official Zakat Assessment Statement')}
                  {modalData.type === 'imsakiya' && (language === 'ar' ? 'جَدْوَلُ مَوَاقِيتِ الصَّلَاةِ وَالإِمْسَاكِيَّةِ' : 'Islamic Prayer Times & Imsakiya Table')}
                  {modalData.type === 'kaffarah' && (language === 'ar' ? 'تَقْدِيرُ الكَفَّارَاتِ وَالفِدْيَةِ الشَّرْعِيَّةِ' : 'Atonement & Legal Expiations Report')}
                  {modalData.type === 'iddah' && (language === 'ar' ? 'بَيَانُ فَتْرَةِ العِدَّةِ الشَّرْعِيَّةِ وَأَحْكَامِهَا' : 'Shariah Waiting Period Certificate')}
                  {modalData.type === 'finance' && (language === 'ar' ? 'عَقْدُ تَسْوِيَةٍ وَمُحَاسَبَةٍ مَالِيَّةٍ إِسْلَامِيَّةٍ' : 'Islamic Financial Calculation Agreement')}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {language === 'ar' ? 'منصة القسطاس للحسابات الشرعية والفلكية' : 'Al-Qistas Islamic Jurisprudence Platform'} • {currentDateGreg}
                </p>
              </div>

              {/* Content Type 1: Inheritance Certificate */}
              {modalData.type === 'inheritance' && modalData.result && (
                <div className="space-y-4 text-xs">
                  {/* Estate Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f4ede0] p-3 rounded-lg border border-[#c8a951]/40 text-center">
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'إجمالي التركة' : 'Gross Estate'}</span>
                      <span className="font-bold text-[#0f3d2e]">{modalData.result.grossEstate.toLocaleString()} {modalData.currency}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'الديون والمؤن' : 'Debts & Funeral'}</span>
                      <span className="font-bold text-rose-700">-{(modalData.result.debts + modalData.result.funeralExpenses).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'صافي التركة' : 'Net Estate'}</span>
                      <span className="font-bold text-[#0f3d2e] text-sm">{Math.round(modalData.result.netEstate).toLocaleString()} {modalData.currency}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'أصل المسألة' : 'Base Denom.'}</span>
                      <span className="font-bold text-[#0f3d2e]">{modalData.result.baseDenominator} {modalData.result.adjustmentType !== 'none' ? `(${modalData.result.adjustmentType})` : ''}</span>
                    </div>
                  </div>

                  {/* Heirs Table */}
                  <table className="w-full border-collapse border border-[#0f3d2e]/30 text-xs mt-4">
                    <thead>
                      <tr className="bg-[#0f3d2e] text-white">
                        <th className="border border-[#0f3d2e]/30 p-2 text-start">الوارث</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">العدد</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">الفرض المقدر</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">النسبة</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-end">نصيب الفرد</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-end">إجمالي النصيب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.result.heirsShares.map((s: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#faf8f2]'}>
                          <td className="border border-slate-300 p-2 font-bold text-[#0f3d2e] text-start">{language === 'ar' ? s.titleAr : s.titleEn}</td>
                          <td className="border border-slate-300 p-2 text-center">{s.count}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-bold">{s.shareFraction}</td>
                          <td className="border border-slate-300 p-2 text-center">{s.sharePercent.toFixed(1)}%</td>
                          <td className="border border-slate-300 p-2 text-end">{Math.round(s.amountPerHeir).toLocaleString()}</td>
                          <td className="border border-slate-300 p-2 text-end font-bold text-[#0f3d2e]">{Math.round(s.totalAmount).toLocaleString()} {modalData.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Blocked Heirs */}
                  {modalData.result.blockedHeirs.length > 0 && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                      <span className="font-bold">المحجوبون حجب حرمان: </span>
                      {modalData.result.blockedHeirs.map((b: any, i: number) => (
                        <span key={i} className="inline-block mx-1">
                          {b.titleAr} (حُجب بـ: {b.blockedByAr})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Type 2: Zakat Statement */}
              {modalData.type === 'zakat' && modalData.result && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-2 bg-[#f4ede0] p-3 rounded-lg border border-[#c8a951]/40 text-center">
                    <div>
                      <span className="text-slate-600 block text-[10px]">إجمالي الأموال الخاضعة</span>
                      <span className="font-bold text-[#0f3d2e]">{Math.round(modalData.result.totalGrossWealth).toLocaleString()} {modalData.currency}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">الديون المخصومة</span>
                      <span className="font-bold text-rose-700">-{Math.round(modalData.result.totalDeductions).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">صافي الوعاء الزكوي</span>
                      <span className="font-bold text-[#0f3d2e]">{Math.round(modalData.result.netZakatWealth).toLocaleString()} {modalData.currency}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-center">
                    <span className="text-xs text-emerald-800 font-bold block">إجمالي الزكاة الشرعية الواجب إخراجها فوراً:</span>
                    <span className="font-amiri text-3xl font-extrabold text-[#0f3d2e] block mt-1">
                      {Math.round(modalData.result.grandTotalZakat).toLocaleString()} {modalData.currency}
                    </span>
                    <span className="text-[11px] text-emerald-700 block mt-1">
                      نسبة الزكاة المطبقة: {(modalData.result.rateApplied * 100).toFixed(3)}%
                    </span>
                  </div>

                  {modalData.result.livestockObligations.length > 0 && (
                    <div className="p-3 bg-[#faf8f2] border border-[#c8a951]/30 rounded-lg">
                      <span className="font-bold text-[#0f3d2e] block mb-1">الأنعام الواجبة عيناً:</span>
                      {modalData.result.livestockObligations.map((o: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-700">
                          • {o.obligationAr} ({o.descriptionAr})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Type 3: Prayer Times & Imsakiya */}
              {modalData.type === 'imsakiya' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center bg-[#f4ede0] p-3 rounded-lg border border-[#c8a951]/40">
                    <div>
                      <span className="text-[11px] text-slate-600">المدينة / الموقع:</span>
                      <span className="font-bold text-[#0f3d2e] mx-2 text-sm">{modalData.city}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600">زاوية القبلة:</span>
                      <span className="font-bold text-[#0f3d2e] mx-2">{modalData.qibla?.bearing}°</span>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-[#0f3d2e]/30 text-xs">
                    <thead>
                      <tr className="bg-[#0f3d2e] text-white">
                        <th className="border p-2">الصلاة</th>
                        <th className="border p-2">الوقت</th>
                        <th className="border p-2">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.prayers?.map((p: any) => (
                        <tr key={p.id} className="border text-center">
                          <td className="p-2 font-bold text-[#0f3d2e]">{p.nameAr} / {p.nameEn}</td>
                          <td className="p-2 font-mono font-bold text-sm">{p.timeString}</td>
                          <td className="p-2 text-slate-600 text-[11px]">
                            {p.id === 'fajr' ? 'بداية الصيام والإمساك' : p.id === 'maghrib' ? 'موعد الإفطار' : 'صلاة مفروضة'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Content Type 4: Kaffarah */}
              {modalData.type === 'kaffarah' && modalData.result && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40">
                    <span className="font-bold text-[#0f3d2e] block text-sm">{modalData.result.titleAr}</span>
                    <p className="text-slate-700 mt-1">{modalData.result.primaryObligationAr}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white border border-slate-300 rounded">
                      <span className="text-slate-500 block text-[10px]">الكمية أو الوجبات</span>
                      <span className="font-bold text-lg text-[#0f3d2e]">{modalData.result.mealsCount || modalData.result.foodQuantityKg}</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-300 rounded">
                      <span className="text-slate-500 block text-[10px]">التقدير النقدي</span>
                      <span className="font-bold text-lg text-emerald-800">{Math.round(modalData.result.estimatedCost).toLocaleString()} {modalData.currency}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-s-4 border-[#0f3d2e] text-[11px] text-slate-700 font-amiri leading-relaxed">
                    {modalData.result.quranicRefAr}
                  </div>
                </div>
              )}

              {/* Content Type 5: Iddah */}
              {modalData.type === 'iddah' && modalData.result && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40">
                    <span className="font-bold text-[#0f3d2e] block text-sm">{modalData.result.titleAr}</span>
                    <p className="text-slate-700 mt-1">{modalData.result.quranicEvidenceAr}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white border border-slate-300 rounded">
                      <span className="text-slate-500 block text-[10px]">تاريخ البداية</span>
                      <span className="font-bold text-[#0f3d2e]">{modalData.result.startDateHijri}</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-300 rounded">
                      <span className="text-slate-500 block text-[10px]">تاريخ الانتهاء المقدر</span>
                      <span className="font-bold text-emerald-800">{modalData.result.endDateHijri}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Type 6: Finance */}
              {modalData.type === 'finance' && modalData.result && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40 text-center">
                    <span className="text-xs text-slate-600 block">نوع العقد:</span>
                    <span className="font-amiri font-bold text-xl text-[#0f3d2e] block">
                      {modalData.contractType === 'mudarabah' ? 'عقد مضاربة شرعية' : modalData.contractType === 'musharakah' ? 'عقد مشاركة إسلامية' : 'عقد بيع مرابحة للآمر بالشراء'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs leading-relaxed">
                    «الربح على ما اشترطا، والوضيعة (الخسارة) على قدر المالين»
                  </div>
                </div>
              )}

              {/* Official Stamp & Signatures */}
              <div className="mt-8 pt-6 border-t-2 border-[#0f3d2e]/20 flex flex-row items-center justify-between text-[11px] text-slate-500">
                <div className="space-y-1">
                  <p className="font-bold text-[#0f3d2e]">منصة القسطاس للحسابات الشرعية</p>
                  <p>Al-Qistas Digital Shariah Engine</p>
                  <p className="text-[10px] text-slate-400">معتمد وفق المعايير الفقهية للأزهر ومجمع الفقه الدولي</p>
                </div>

                {/* Digital Seal */}
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#c8a951] flex flex-col items-center justify-center text-[#c8a951] font-amiri text-center p-1">
                  <span className="text-sm">۞</span>
                  <span className="text-[9px] font-bold">معتمد شرعاً</span>
                  <span className="text-[7px]">Al-Qistas Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
