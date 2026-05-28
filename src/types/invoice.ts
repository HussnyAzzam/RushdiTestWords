// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/types/invoice.ts

export type BusinessType = "exempt" | "licensed" | "company";

export type DocumentType =
  | "tax_invoice"
  | "receipt"
  | "tax_invoice_receipt"
  | "quote"
  | "transaction_invoice"
  | "payment_request"
  | "work_order";

export type DiscountType = "none" | "percentage" | "fixed";

export interface BankDetails {
  bankName?: string;
  branchNumber?: string;
  accountNumber?: string;
  iban?: string;
}

export interface BusinessDetails {
  id: string;
  name: string;
  type: BusinessType;
  idNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoDataUrl?: string;
  stampDataUrl?: string;
  signatureDataUrl?: string;
  bankDetails?: BankDetails;
  paymentInstructions?: string;
  defaultNotes?: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  idNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  code?: string;
  description: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  vatRate: number;
  order: number;
}

export interface DocumentMetadata {
  documentType: DocumentType;
  documentNumber: string;
  allocationNumber?: string;
  issueDate: string;
  supplyDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  currency: string;
  vatRate: number;
}

export interface DocumentCalculations {
  subtotal: number;
  rowDiscounts: number;
  globalDiscount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  total: number;
  amountPaid?: number;
  balance?: number;
}

export interface DocumentData {
  id: string;
  metadata: DocumentMetadata;
  business: BusinessDetails;
  customer: CustomerDetails;
  items: InvoiceItem[];
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  notes?: string;
  calculations: DocumentCalculations;
  templateId: string;
  templateCustomization?: TemplateCustomization;
  createdAt: string;
  modifiedAt: string;
}

export interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  logoPosition: "top-left" | "top-center" | "top-right";
  headerStyle: "simple" | "colored" | "full";
  showWebsite: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showItemCode: boolean;
  showVatColumn: boolean;
  showDiscountColumn: boolean;
  showSignature: boolean;
  showStamp: boolean;
  showPaymentDetails: boolean;
  showAllocationNumber: boolean;
  paperSize: "A4" | "A5";
  margins: "normal" | "compact" | "wide";
}

export interface ExportedSettings {
  business: BusinessDetails;
  defaultDocumentType: DocumentType;
  defaultTemplateId: string;
  templateCustomization?: TemplateCustomization;
  defaultPaymentTerms?: string;
  defaultNotes?: string;
  exportDate: string;
  version: "1.0";
  includeImages: boolean;
}

export interface DocumentNumber {
  documentType: DocumentType;
  lastNumber: number;
}
