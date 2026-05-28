// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/lib/invoiceCalculations.ts

import { InvoiceItem, DiscountType, DocumentCalculations } from "../types/invoice";

export class InvoiceCalculations {
  /**
   * Calculate row total with discount and VAT
   */
  static calculateRowTotal(item: InvoiceItem): number {
    // quantity × unit price = gross base
    const grossBase = item.quantity * item.unitPrice;

    // Apply row discount
    const rowDiscount = this.calculateDiscount(grossBase, item.discountType, item.discountValue);
    const afterRowDiscount = grossBase - rowDiscount;

    // Apply VAT
    const vat = (afterRowDiscount * item.vatRate) / 100;

    return afterRowDiscount + vat;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(base: number, type: DiscountType, value: number): number {
    if (type === "none" || value === 0) return 0;
    if (type === "percentage") return (base * value) / 100;
    if (type === "fixed") return Math.min(value, base);
    return 0;
  }

  /**
   * Calculate row subtotal (before VAT)
   */
  static calculateRowSubtotal(item: InvoiceItem): number {
    const grossBase = item.quantity * item.unitPrice;
    const rowDiscount = this.calculateDiscount(grossBase, item.discountType, item.discountValue);
    return grossBase - rowDiscount;
  }

  /**
   * Calculate all document totals
   */
  static calculateDocumentTotals(
    items: InvoiceItem[],
    globalDiscountType: DiscountType,
    globalDiscountValue: number,
    businessType: string
  ): DocumentCalculations {
    // Calculate subtotal before any global discount
    let subtotal = 0;
    let rowDiscounts = 0;
    let totalVat = 0;

    items.forEach((item) => {
      const grossBase = item.quantity * item.unitPrice;
      const rowDiscount = this.calculateDiscount(grossBase, item.discountType, item.discountValue);
      const afterRowDiscount = grossBase - rowDiscount;

      subtotal += afterRowDiscount;
      rowDiscounts += rowDiscount;

      // VAT calculation
      if (businessType !== "exempt" && item.vatRate > 0) {
        totalVat += (afterRowDiscount * item.vatRate) / 100;
      }
    });

    // Calculate global discount
    const globalDiscount = this.calculateDiscount(subtotal, globalDiscountType, globalDiscountValue);
    const subtotalAfterDiscount = subtotal - globalDiscount;

    // Recalculate VAT after global discount if applicable
    let finalVat = totalVat;
    if (globalDiscount > 0 && businessType !== "exempt") {
      // VAT is typically calculated on discounted amount
      finalVat = 0;
      items.forEach((item) => {
        if (item.vatRate > 0) {
          const grossBase = item.quantity * item.unitPrice;
          const rowDiscount = this.calculateDiscount(grossBase, item.discountType, item.discountValue);
          const afterRowDiscount = (grossBase - rowDiscount) * ((subtotalAfterDiscount) / subtotal);
          finalVat += (afterRowDiscount * item.vatRate) / 100;
        }
      });
    }

    const total = subtotalAfterDiscount + finalVat;

    return {
      subtotal,
      rowDiscounts,
      globalDiscount,
      subtotalAfterDiscount,
      vatAmount: finalVat,
      total
    };
  }

  /**
   * Format number as currency
   */
  static formatCurrency(amount: number, symbol: string = "₪", position: "before" | "after" = "before"): string {
    const formatted = amount.toLocaleString("he-IL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (position === "before") {
      return `${symbol}${formatted}`;
    }
    return `${formatted}${symbol}`;
  }

  /**
   * Format date as DD/MM/YYYY
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Parse date from DD/MM/YYYY
   */
  static parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Validate invoice data
   */
  static validateInvoice(items: InvoiceItem[], businessName: string, documentNumber: string): string[] {
    const errors: string[] = [];

    if (!businessName || businessName.trim().length === 0) {
      errors.push("שם העסק נדרש");
    }

    if (!documentNumber || documentNumber.trim().length === 0) {
      errors.push("מספר המסמך נדרש");
    }

    if (!items || items.length === 0) {
      errors.push("נדרש לפחות פריט אחד");
    }

    items.forEach((item, idx) => {
      if (!item.description || item.description.trim().length === 0) {
        errors.push(`הפריט ${idx + 1}: תיאור נדרש`);
      }
      if (item.quantity <= 0) {
        errors.push(`הפריט ${idx + 1}: כמות חייבת להיות גדולה מ-0`);
      }
      if (item.unitPrice < 0) {
        errors.push(`הפריט ${idx + 1}: מחיר יחידה לא יכול להיות שלילי`);
      }
    });

    return errors;
  }
}

export default InvoiceCalculations;
