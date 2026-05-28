// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/lib/invoicePDFExport.ts

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DocumentData } from "../types/invoice";
import { invoiceSettings } from "../config/invoiceSettings";

export class InvoicePDFExport {
  /**
   * Export invoice as PDF
   */
  static async exportPDF(
    documentElement: HTMLElement | null,
    documentData: DocumentData,
    filename?: string
  ): Promise<void> {
    if (!documentElement) {
      throw new Error("Document element not found");
    }

    try {
      // Get page dimensions based on paper size
      const { width, height } = this.getPageDimensions(
        documentData.templateCustomization?.paperSize || "A4"
      );

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: documentData.templateCustomization?.paperSize === "A5" ? "a5" : "a4"
      });

      // Convert element to canvas
      const canvas = await html2canvas(documentElement, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true
      });

      // Calculate dimensions for PDF
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = width;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Add additional pages if needed
      let yPosition = imgHeight;
      while (yPosition > height) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, yPosition - height, imgWidth, height);
        yPosition -= height;
      }

      // Save PDF
      const pdfFilename = filename || `invoice-${documentData.metadata.documentNumber}.pdf`;
      pdf.save(pdfFilename);
    } catch (error) {
      console.error("PDF export error:", error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Export invoice as PNG
   */
  static async exportPNG(
    documentElement: HTMLElement | null,
    documentData: DocumentData,
    filename?: string
  ): Promise<void> {
    if (!documentElement) {
      throw new Error("Document element not found");
    }

    try {
      const canvas = await html2canvas(documentElement, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true
      });

      // Download canvas as PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename || `invoice-${documentData.metadata.documentNumber}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("PNG export error:", error);
      throw new Error(`Failed to export PNG: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get page dimensions in mm
   */
  private static getPageDimensions(paperSize: "A4" | "A5"): { width: number; height: number } {
    const dimensions = {
      A4: { width: 210, height: 297 },
      A5: { width: 148, height: 210 }
    };
    return dimensions[paperSize];
  }

  /**
   * Get print-friendly HTML
   */
  static getPrintHTML(
    documentElement: HTMLElement | null
  ): string {
    if (!documentElement) {
      return "";
    }
    return documentElement.innerHTML;
  }

  /**
   * Print document
   */
  static printDocument(documentElement: HTMLElement | null, documentNumber: string): void {
    if (!documentElement) {
      throw new Error("Document element not found");
    }

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) {
      throw new Error("Failed to open print window");
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>חשבונית ${documentNumber}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; }
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${documentElement.innerHTML}
          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export default InvoicePDFExport;
