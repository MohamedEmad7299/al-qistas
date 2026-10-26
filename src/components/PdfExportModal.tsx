import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { Download, Printer, X, Sparkles } from 'lucide-react';

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
    await exportElementToPdf('pdf-printable-certificate', filename, {
      orientation: 'portrait',
      singlePage: true,
    });
    setIsGenerating(false);
  };

  const handlePrint = () => {
    const cert = document.getElementById('pdf-printable-certificate');
    if (!cert) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for clean 1-page printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and font links
    const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    let stylesHtml = '';
    styleElements.forEach((el) => {
      stylesHtml += el.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}" lang="${language}">
        <head>
          <meta charset="UTF-8">
          <title>${language === 'ar' ? 'التقرير الشرعي المعتمد - القسطاس' : 'Al-Qistas Official Shariah Certificate'}</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #1a202c !important;
              width: 100% !important;
              height: auto !important;
            }
            #pdf-printable-certificate {
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 6mm !important;
              box-shadow: none !important;
              border: 3px double #0f3d2e !important;
              background: #ffffff !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body style="background: #ffffff; padding: 0; margin: 0;">
          ${cert.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  };

  const currentDateGreg = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="pdf-modal-container relative w-full max-w-4xl bg-[#09261e] border-2 border-[#c8a951] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar */}
        <div className="pdf-modal-header flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#07261d] border-b border-[#c8a951]/30 shrink-0 no-print">
          <div className="flex items-center gap-2 text-[#f3e5ab] font-amiri text-base sm:text-lg font-bold">
            <Sparkles className="w-5 h-5 text-[#c8a951]" />
            <span>{language === 'ar' ? 'معاينة التقرير الشرعي للطباعة و PDF' : 'Official PDF Document Preview'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="pdf-modal-print-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b3d2e] border border-[#c8a951]/30 text-white text-xs font-semibold hover:bg-[#114d3a] transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#c8a951]" />
              <span>{t.print}</span>
            </button>

            <button
              onClick={handleDownload}
              type="button"
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#b39238] text-[#07261d] text-xs font-bold hover:brightness-110 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? (language === 'ar' ? 'جارٍ المعالجة...' : 'Generating...') : t.downloadReport}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="pdf-modal-close-btn p-1.5 rounded-lg bg-[#07261d] text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Certificate Area */}
        <div className="pdf-modal-scroll-area p-4 sm:p-6 overflow-y-auto bg-slate-950/70 flex-1">
          {/* Printable Document Container (Styled like a Royal Islamic Certificate) */}
          <div
            id="pdf-printable-certificate"
            className="mx-auto w-full max-w-[760px] bg-white text-[#1a202c] p-6 sm:p-8 shadow-2xl relative border-8 border-double border-[#0f3d2e] rounded-sm font-sans box-border"
            style={{ direction: language === 'ar' ? 'rtl' : 'ltr', colorScheme: 'light' }}
          >
            {/* Islamic Ornate Border Inset */}
            <div className="border border-[#c8a951] p-4 sm:p-6 relative bg-white">
              {/* Corner Ornaments */}
              <span className="absolute -top-3 -left-3 text-[#c8a951] font-amiri text-xl leading-none select-none">۞</span>
              <span className="absolute -top-3 -right-3 text-[#c8a951] font-amiri text-xl leading-none select-none">۞</span>
              <span className="absolute -bottom-3 -left-3 text-[#c8a951] font-amiri text-xl leading-none select-none">۞</span>
              <span className="absolute -bottom-3 -right-3 text-[#c8a951] font-amiri text-xl leading-none select-none">۞</span>

              {/* Bismillah */}
              <div className="text-center mb-3">
                <span className="font-amiri text-2xl sm:text-3xl font-bold text-[#0f3d2e] tracking-wide block">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="text-[11px] text-[#c8a951] font-amiri block mt-0.5">
                  «وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ذَٰلِكَ خَيْرٌ وَأَحْسَنُ تَأْوِيلًا»
                </span>
              </div>

              {/* Title & Badge */}
              <div className="text-center border-b-2 border-[#0f3d2e]/20 pb-3 mb-4">
                <h1 className="font-amiri text-xl sm:text-2xl font-bold text-[#0f3d2e]">
                  {modalData.type === 'inheritance' && (language === 'ar' ? 'حَصْرُ إِرْثٍ وَتَوْزِيعُ تَرِكَةٍ شَرْعِيٌّ' : 'Official Estate Distribution Certificate')}
                  {modalData.type === 'zakat' && (language === 'ar' ? 'بَيَانُ حِسَابِ الزَّكَاةِ الشَّرْعِيَّةِ' : 'Official Zakat Assessment Statement')}
                  {modalData.type === 'imsakiya' && (language === 'ar' ? 'جَدْوَلُ مَوَاقِيتِ الصَّلَاةِ وَالإِمْسَاكِيَّةِ' : 'Islamic Prayer Times & Imsakiya Table')}
                  {modalData.type === 'kaffarah' && (language === 'ar' ? 'تَقْدِيرُ الكَفَّارَاتِ وَالفِدْيَةِ الشَّرْعِيَّةِ' : 'Atonement & Legal Expiations Report')}
                  {modalData.type === 'iddah' && (language === 'ar' ? 'بَيَانُ فَتْرَةِ العِدَّةِ الشَّرْعِيَّةِ وَأَحْكَامِهَا' : 'Shariah Waiting Period Certificate')}
                  {modalData.type === 'finance' && (language === 'ar' ? 'عَقْدُ تَسْوِيَةٍ وَمُحَاسَبَةٍ مَالِيَّةٍ إِسْلَامِيَّةٍ' : 'Islamic Financial Calculation Agreement')}
                </h1>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {language === 'ar' ? 'منصة القسطاس للحسابات الشرعية والفلكية' : 'Al-Qistas Islamic Jurisprudence Platform'} • {currentDateGreg}
                </p>
              </div>

              {/* Content Type 1: Inheritance Certificate */}
              {modalData.type === 'inheritance' && modalData.result && (
                <div className="space-y-3 text-xs">
                  {/* Estate Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f4ede0] p-2.5 rounded-lg border border-[#c8a951]/40 text-center">
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
                  <table className="w-full border-collapse border border-[#0f3d2e]/30 text-xs">
                    <thead>
                      <tr className="bg-[#0f3d2e] text-white">
                        <th className="border border-[#0f3d2e]/30 p-2 text-start">{language === 'ar' ? 'الوارث' : 'Heir'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">{language === 'ar' ? 'العدد' : 'Count'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">{language === 'ar' ? 'الفرض' : 'Share'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">{language === 'ar' ? 'النسبة' : 'Percent'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-end">{language === 'ar' ? 'نصيب الفرد' : 'Individual'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-end">{language === 'ar' ? 'إجمالي النصيب' : 'Total Share'}</th>
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
                  {modalData.result.blockedHeirs && modalData.result.blockedHeirs.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                      <span className="font-bold">{language === 'ar' ? 'المحجوبون حجب حرمان: ' : 'Blocked Heirs: '}</span>
                      {modalData.result.blockedHeirs.map((b: any, i: number) => (
                        <span key={i} className="inline-block mx-1">
                          {b.titleAr} ({language === 'ar' ? 'حُجب بـ: ' : 'Blocked by: '}{b.blockedByAr})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Type 2: Zakat Statement */}
              {modalData.type === 'zakat' && modalData.result && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 bg-[#f4ede0] p-2.5 rounded-lg border border-[#c8a951]/40 text-center">
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'إجمالي الأموال' : 'Gross Wealth'}</span>
                      <span className="font-bold text-[#0f3d2e]">{Math.round(modalData.result.totalGrossWealth).toLocaleString()} {modalData.currency}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'الديون المخصومة' : 'Deducted Debts'}</span>
                      <span className="font-bold text-rose-700">-{Math.round(modalData.result.totalDeductions).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px]">{language === 'ar' ? 'صافي الوعاء الزكوي' : 'Net Zakat Pool'}</span>
                      <span className="font-bold text-[#0f3d2e]">{Math.round(modalData.result.netZakatWealth).toLocaleString()} {modalData.currency}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center">
                    <span className="text-xs text-emerald-800 font-bold block">{language === 'ar' ? 'إجمالي الزكاة الشرعية الواجب إخراجها فوراً:' : 'Total Obligatory Zakat Due Immediately:'}</span>
                    <span className="font-amiri text-2xl sm:text-3xl font-extrabold text-[#0f3d2e] block mt-1">
                      {Math.round(modalData.result.grandTotalZakat).toLocaleString()} {modalData.currency}
                    </span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      {language === 'ar' ? 'نسبة الزكاة المطبقة:' : 'Applied Zakat Rate:'} {(modalData.result.rateApplied * 100).toFixed(3)}%
                    </span>
                  </div>

                  {modalData.result.livestockObligations && modalData.result.livestockObligations.length > 0 && (
                    <div className="p-2.5 bg-[#faf8f2] border border-[#c8a951]/30 rounded-lg">
                      <span className="font-bold text-[#0f3d2e] block mb-1">{language === 'ar' ? 'الأنعام الواجبة عيناً:' : 'In-kind Livestock Obligations:'}</span>
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
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center bg-[#f4ede0] p-2.5 rounded-lg border border-[#c8a951]/40">
                    <div>
                      <span className="text-[11px] text-slate-600">{language === 'ar' ? 'المدينة / الموقع:' : 'City / Location:'}</span>
                      <span className="font-bold text-[#0f3d2e] mx-2 text-sm">{modalData.city}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600">{language === 'ar' ? 'زاوية اتجاه القبلة:' : 'Qibla Bearing:'}</span>
                      <span className="font-bold text-[#0f3d2e] mx-2">{modalData.qibla?.bearing}°</span>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-[#0f3d2e]/30 text-xs">
                    <thead>
                      <tr className="bg-[#0f3d2e] text-white">
                        <th className="border border-[#0f3d2e]/30 p-2 text-start">{language === 'ar' ? 'الصلاة' : 'Prayer'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-center">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                        <th className="border border-[#0f3d2e]/30 p-2 text-start">{language === 'ar' ? 'الملاحظات الفقهية' : 'Shariah Note'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.prayers?.map((p: any, idx: number) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#faf8f2]'}>
                          <td className="border border-slate-300 p-2 font-bold text-[#0f3d2e] text-start">
                            {language === 'ar' ? p.nameAr : p.nameEn}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-sm text-center">
                            {p.timeString}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600 text-[11px] text-start">
                            {p.id === 'fajr'
                              ? (language === 'ar' ? 'بداية الصيام والإمساك' : 'Start of Fasting & Imsak')
                              : p.id === 'sunrise'
                              ? (language === 'ar' ? 'شروق الشمس (نهاية وقت الفجر)' : 'Sunrise (End of Fajr time)')
                              : p.id === 'maghrib'
                              ? (language === 'ar' ? 'موعد الإفطار وصلاة المغرب' : 'Iftar & Sunset Prayer')
                              : (language === 'ar' ? 'صلاة مفروضة' : 'Obligatory Daily Prayer')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Content Type 4: Kaffarah */}
              {modalData.type === 'kaffarah' && modalData.result && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40">
                    <span className="font-bold text-[#0f3d2e] block text-sm">{modalData.result.titleAr}</span>
                    <p className="text-slate-700 mt-1">{modalData.result.primaryObligationAr}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-white border border-slate-300 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'الكمية أو عدد الوجبات' : 'Meals or Quantity'}</span>
                      <span className="font-bold text-lg text-[#0f3d2e]">{modalData.result.mealsCount || modalData.result.foodQuantityKg}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-300 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'التقدير المالي' : 'Estimated Cost'}</span>
                      <span className="font-bold text-lg text-emerald-800">{Math.round(modalData.result.estimatedCost).toLocaleString()} {modalData.currency}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border-s-4 border-[#0f3d2e] text-[11px] text-slate-700 font-amiri leading-relaxed">
                    {modalData.result.quranicRefAr}
                  </div>
                </div>
              )}

              {/* Content Type 5: Iddah */}
              {modalData.type === 'iddah' && modalData.result && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40">
                    <span className="font-bold text-[#0f3d2e] block text-sm">{modalData.result.titleAr}</span>
                    <p className="text-slate-700 mt-1">{modalData.result.quranicEvidenceAr}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-white border border-slate-300 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</span>
                      <span className="font-bold text-[#0f3d2e]">{modalData.result.startDateHijri}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-300 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'تاريخ الانتهاء المقدر' : 'Estimated End Date'}</span>
                      <span className="font-bold text-emerald-800">{modalData.result.endDateHijri}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Type 6: Finance */}
              {modalData.type === 'finance' && modalData.result && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-[#f4ede0] rounded-lg border border-[#c8a951]/40 text-center">
                    <span className="text-[10px] text-slate-600 block">{language === 'ar' ? 'نوع العقد المالي:' : 'Contract Type:'}</span>
                    <span className="font-amiri font-bold text-xl text-[#0f3d2e] block mt-0.5">
                      {modalData.contractType === 'mudarabah'
                        ? (language === 'ar' ? 'عقد مضاربة شرعية' : 'Mudarabah Islamic Contract')
                        : modalData.contractType === 'musharakah'
                        ? (language === 'ar' ? 'عقد مشاركة إسلامية' : 'Musharakah Islamic Partnership')
                        : (language === 'ar' ? 'عقد بيع مرابحة للآمر بالشراء' : 'Murabaha Purchase Order Sale')}
                    </span>
                  </div>

                  {modalData.contractType === 'mudarabah' && (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'مستحقات رب المال' : 'Capital Provider Payout'}</span>
                        <span className="font-bold text-base text-[#0f3d2e]">
                          {Math.round(modalData.result.rabbAlMalTotalPayout || 0).toLocaleString()} {modalData.currency}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {modalData.result.isLoss
                            ? (language === 'ar' ? 'بعد خصم الخسارة' : 'After loss deduction')
                            : `${language === 'ar' ? 'ربح: +' : 'Profit: +'}${Math.round(modalData.result.rabbAlMalReturn || 0).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'مستحقات المضارب (العامل)' : 'Mudarib Return'}</span>
                        <span className="font-bold text-base text-[#0f3d2e]">
                          {Math.round(modalData.result.mudaribReturn || 0).toLocaleString()} {modalData.currency}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {modalData.result.isLoss
                            ? (language === 'ar' ? 'خسارة الجهد فقط' : 'Effort loss only')
                            : `${Math.round(modalData.result.mudaribProfitRatio || 0)}% ${language === 'ar' ? 'من الأرباح' : 'of profit'}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {modalData.contractType === 'musharakah' && (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'مستحقات الشريك الأول' : 'Partner 1 Payout'}</span>
                        <span className="font-bold text-base text-[#0f3d2e]">
                          {Math.round(modalData.result.payoutA || 0).toLocaleString()} {modalData.currency}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'مستحقات الشريك الثاني' : 'Partner 2 Payout'}</span>
                        <span className="font-bold text-base text-[#0f3d2e]">
                          {Math.round(modalData.result.payoutB || 0).toLocaleString()} {modalData.currency}
                        </span>
                      </div>
                    </div>
                  )}

                  {modalData.contractType === 'murabaha' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'إجمالي البيع' : 'Total Price'}</span>
                        <span className="font-bold text-sm text-[#0f3d2e]">
                          {Math.round(modalData.result.totalSellingPrice || 0).toLocaleString()} {modalData.currency}
                        </span>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'هامش الربح' : 'Profit Amount'}</span>
                        <span className="font-bold text-sm text-emerald-700">
                          {Math.round(modalData.result.profitAmount || 0).toLocaleString()} {modalData.currency}
                        </span>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'القسط الشهري' : 'Monthly Installment'}</span>
                        <span className="font-bold text-sm text-[#0f3d2e]">
                          {Math.round(modalData.result.monthlyInstallment || 0).toLocaleString()} {modalData.currency}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs leading-relaxed text-center font-amiri">
                    «الربح على ما اشترطا، والوضيعة (الخسارة) على قدر المالين»
                  </div>
                </div>
              )}

              {/* Official Stamp & Signatures */}
              <div className="mt-6 pt-4 border-t-2 border-[#0f3d2e]/20 flex flex-row items-center justify-between text-[11px] text-slate-500">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#0f3d2e] text-xs">
                    {language === 'ar' ? 'منصة القسطاس للحسابات الشرعية والفلكية' : 'Al-Qistas Digital Shariah Engine'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Al-Qistas Islamic Jurisprudence & Astronomical Platform
                  </p>
                  <p className="text-[10px] text-[#c8a951] font-medium">
                    {language === 'ar' ? 'معتمد وفق المعايير الفقهية للأزهر الشريف ومجمع الفقه الإسلامي الدولي' : 'Accredited per Al-Azhar & International Islamic Fiqh Academy standards'}
                  </p>
                </div>

                {/* Digital Seal */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full border-2 border-dashed border-[#c8a951] bg-[#fdfbf7] flex flex-col items-center justify-center text-[#c8a951] font-amiri text-center p-1 shadow-sm">
                  <span className="text-sm leading-none">۞</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#0f3d2e] leading-tight">معتمد شرعاً</span>
                  <span className="text-[7px] text-slate-500 font-sans leading-tight">Al-Qistas Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
