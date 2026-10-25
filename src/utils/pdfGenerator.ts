import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  singlePage?: boolean;
}

export async function exportElementToPdf(
  elementId: string,
  filename: string,
  optionsOrOrientation: 'portrait' | 'landscape' | PdfExportOptions = 'portrait'
): Promise<void> {
  const options: PdfExportOptions =
    typeof optionsOrOrientation === 'string'
      ? { orientation: optionsOrOrientation, singlePage: true }
      : { orientation: 'portrait', singlePage: true, ...optionsOrOrientation };

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return;
  }

  try {
    const orientation = options.orientation || 'portrait';
    const canvas = await html2canvas(element, {
      scale: 2, // 2x high resolution for crisp text & borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (options.singlePage !== false) {
      // Guaranteed SINGLE-PAGE A4 layout
      // 6mm margin for clean printable borders
      const margin = 6;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const imgAspect = canvas.width / canvas.height;
      let renderWidth = printableWidth;
      let renderHeight = printableWidth / imgAspect;

      // If renderHeight exceeds the printable page height, constrain by height
      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = printableHeight * imgAspect;
      }

      // Center the certificate within the printable area
      const xOffset = margin + (printableWidth - renderWidth) / 2;
      const yOffset = margin + (printableHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Multi-page fallback if explicitly requested
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: window.print()
    window.print();
  }
}
