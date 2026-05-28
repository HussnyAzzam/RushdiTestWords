// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/lib/invoiceImportExport.ts

import { DocumentData, ExportedSettings, BusinessDetails } from "../types/invoice";
import { invoiceSettings } from "../config/invoiceSettings";

export class InvoiceImportExport {
  /**
   * Export settings as JSON file
   */
  static exportSettings(
    business: BusinessDetails,
    defaultDocumentType: string,
    defaultTemplateId: string,
    defaultPaymentTerms?: string,
    defaultNotes?: string,
    includeImages: boolean = false
  ): void {
    const settings: ExportedSettings = {
      business: includeImages ? business : {
        ...business,
        logoDataUrl: undefined,
        stampDataUrl: undefined,
        signatureDataUrl: undefined
      },
      defaultDocumentType: defaultDocumentType as any,
      defaultTemplateId,
      defaultPaymentTerms,
      defaultNotes,
      exportDate: new Date().toISOString(),
      version: "1.0",
      includeImages
    };

    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    this.downloadFile(blob, `business-invoice-settings-${new Date().toISOString().slice(0, 10)}.json`);
  }

  /**
   * Import settings from JSON file
   */
  static async importSettings(file: File): Promise<ExportedSettings> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const settings = JSON.parse(content) as ExportedSettings;
          
          // Validate imported settings
          if (!settings.business || !settings.business.name) {
            throw new Error("Invalid settings file: missing business name");
          }

          resolve(settings);
        } catch (error) {
          reject(new Error(`Failed to import settings: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Export document as JSON
   */
  static exportDocumentJSON(document: DocumentData): void {
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    this.downloadFile(blob, `invoice-${document.metadata.documentNumber}.json`);
  }

  /**
   * Export multiple documents as JSON array
   */
  static exportDocumentsJSON(documents: DocumentData[]): void {
    const jsonString = JSON.stringify(documents, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    this.downloadFile(blob, `invoices-export-${new Date().toISOString().slice(0, 10)}.json`);
  }

  /**
   * Import documents from JSON file
   */
  static async importDocumentsJSON(file: File): Promise<DocumentData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          
          const documents = Array.isArray(data) ? data : [data];
          
          // Basic validation
          if (documents.length === 0) {
            throw new Error("No documents found in file");
          }

          resolve(documents as DocumentData[]);
        } catch (error) {
          reject(new Error(`Failed to import documents: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Save document to localStorage
   */
  static saveDocumentLocally(document: DocumentData): void {
    try {
      const documents = this.getLocalDocuments();
      const index = documents.findIndex(d => d.id === document.id);
      
      if (index >= 0) {
        documents[index] = document;
      } else {
        documents.push(document);
      }

      localStorage.setItem("invoice_documents", JSON.stringify(documents));
    } catch (error) {
      console.error("Failed to save document locally:", error);
      throw new Error("Storage quota exceeded or unavailable");
    }
  }

  /**
   * Load document from localStorage
   */
  static loadDocumentLocally(id: string): DocumentData | null {
    try {
      const documents = this.getLocalDocuments();
      return documents.find(d => d.id === id) || null;
    } catch (error) {
      console.error("Failed to load document:", error);
      return null;
    }
  }

  /**
   * Get all locally stored documents
   */
  static getLocalDocuments(): DocumentData[] {
    try {
      const data = localStorage.getItem("invoice_documents");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get local documents:", error);
      return [];
    }
  }

  /**
   * Delete document from localStorage
   */
  static deleteDocumentLocally(id: string): void {
    try {
      const documents = this.getLocalDocuments();
      const filtered = documents.filter(d => d.id !== id);
      localStorage.setItem("invoice_documents", JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

  /**
   * Clear all local documents
   */
  static clearAllLocalDocuments(): void {
    try {
      localStorage.removeItem("invoice_documents");
    } catch (error) {
      console.error("Failed to clear documents:", error);
    }
  }

  /**
   * Download file helper
   */
  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get storage usage
   */
  static getStorageStats(): { used: number; percentage: number } {
    try {
      const documents = this.getLocalDocuments();
      const settingsData = localStorage.getItem("invoice_settings") || "";
      const documentsData = localStorage.getItem("invoice_documents") || "";
      
      const used = (settingsData.length + documentsData.length) / 1024; // KB
      const percentage = (used / 5120) * 100; // 5MB limit

      return { used: Math.round(used * 100) / 100, percentage };
    } catch {
      return { used: 0, percentage: 0 };
    }
  }
}

export default InvoiceImportExport;
