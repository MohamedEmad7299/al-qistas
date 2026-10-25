import React, { useState } from 'react';
import { Language } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { IslamicBackground } from './components/IslamicBackground';
import { InheritanceCalculator } from './components/InheritanceCalculator';
import { ZakatCalculator } from './components/ZakatCalculator';
import { PrayerTimesAndQibla } from './components/PrayerTimesAndQibla';
import { HijriCalendarMoon } from './components/HijriCalendarMoon';
import { KaffarahCalculator } from './components/KaffarahCalculator';
import { IddahCalculator } from './components/IddahCalculator';
import { FinanceCalculator } from './components/FinanceCalculator';
import { PdfExportModal } from './components/PdfExportModal';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<string>('inheritance');

  // PDF Modal State
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [pdfModalData, setPdfModalData] = useState<any>(null);

  const handleOpenPdf = (data: any) => {
    setPdfModalData(data);
    setIsPdfOpen(true);
  };

  const handleClosePdf = () => {
    setIsPdfOpen(false);
    setPdfModalData(null);
  };

  return (
    <div className="min-h-screen bg-[#051a14] text-slate-100 flex flex-col relative selection:bg-[#c8a951] selection:text-[#051a14]">
      {/* Background Islamic SVG geometric pattern */}
      <IslamicBackground />

      {/* Header with Navigation and Language Toggle */}
      <Header
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10">
        {activeTab === 'inheritance' && (
          <InheritanceCalculator language={language} onOpenPdfModal={handleOpenPdf} />
        )}
        {activeTab === 'zakat' && (
          <ZakatCalculator language={language} onOpenPdfModal={handleOpenPdf} />
        )}
        {activeTab === 'prayers' && (
          <PrayerTimesAndQibla language={language} onOpenPdfModal={handleOpenPdf} />
        )}
        {activeTab === 'calendar' && (
          <HijriCalendarMoon language={language} />
        )}
        {activeTab === 'kaffarah' && (
          <KaffarahCalculator language={language} onOpenPdfModal={handleOpenPdf} />
        )}
        {activeTab === 'iddah' && (
          <IddahCalculator language={language} onOpenPdfModal={handleOpenPdf} />
        )}
        {activeTab === 'finance' && (
          <FinanceCalculator language={language} onOpenPdfModal={handleOpenPdf} />
        )}
      </main>

      {/* Footer */}
      <Footer language={language} />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfOpen}
        onClose={handleClosePdf}
        language={language}
        modalData={pdfModalData}
      />
    </div>
  );
};

export default App;
