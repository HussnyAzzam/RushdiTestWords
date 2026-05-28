// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/config/invoiceSettings.ts

export const invoiceSettings = {
  locale: "he-IL",
  direction: "rtl",
  language: "he",

  currency: {
    code: "ILS",
    symbol: "₪",
    position: "before" // before or after
  },

  tax: {
    vatName: "מע״מ",
    defaultVatRate: 18,
    exemptBusinessVatRate: 0
  },

  documentNumbering: {
    defaultStartNumber: 1,
    minDigits: 4
  },

  allocationNumber: {
    enabledByDefault: true,
    label: "מספר הקצאה",
    requiredByDefault: false,
    description: "מספר הקצאה נדרש רק לחשבוניות מס לעוסק מורשה כאשר הסכום לפני מע״מ עולה על ₪10,000",
    applicableDocTypes: ["tax_invoice", "tax_invoice_receipt"],
    applicableBusinessTypes: ["licensed", "company"],
    minimumAmount: 10000
  },

  dates: {
    displayFormat: "DD/MM/YYYY"
  },

  defaultTexts: {
    notesLabel: "הערות",
    paymentTermsLabel: "תנאי תשלום",
    immediatePayment: "תשלום מיידי",
    bankTransfer: "העברה בנקאית",
    check: "צ'ק",
    cash: "מזומן",
    creditCard: "כרטיס אשראי",
    originalCopyText: "מקור",
    copyText: "העתק",
    totalToPay: "סה״כ לתשלום",
    subtotal: "סכום לפני מע״מ",
    vatAmount: "סכום מע״מ",
    discount: "הנחה",
    discountType: "סוג הנחה",
    percentage: "אחוז",
    fixedAmount: "סכום קבוע"
  },

  businessTypes: {
    exempt: {
      label: "עוסק פטור",
      usesVat: false,
      requiresAllocationNumber: false
    },
    licensed: {
      label: "עוסק מורשה",
      usesVat: true,
      requiresAllocationNumber: true
    },
    company: {
      label: "חברה בע״מ",
      usesVat: true,
      requiresAllocationNumber: true
    }
  },

  documentTypes: {
    tax_invoice: {
      label: "חשבונית מס",
      code: "inv_tax",
      requiresItems: true,
      showVat: true,
      showDiscount: true,
      showAllocationNumber: true,
      requiresIssueDate: true,
      requiresSupplyDate: true,
      showPaymentTerms: true
    },
    receipt: {
      label: "קבלה",
      code: "receipt",
      requiresItems: true,
      showVat: true,
      showDiscount: true,
      showAllocationNumber: false,
      requiresIssueDate: true,
      requiresSupplyDate: false,
      showPaymentTerms: false
    },
    tax_invoice_receipt: {
      label: "חשבונית מס/קבלה",
      code: "inv_receipt",
      requiresItems: true,
      showVat: true,
      showDiscount: true,
      showAllocationNumber: true,
      requiresIssueDate: true,
      requiresSupplyDate: true,
      showPaymentTerms: true
    },
    quote: {
      label: "הצעת מחיר",
      code: "quote",
      requiresItems: true,
      showVat: false,
      showDiscount: true,
      showAllocationNumber: false,
      requiresIssueDate: true,
      requiresSupplyDate: false,
      showPaymentTerms: false
    },
    transaction_invoice: {
      label: "חשבון עסקה",
      code: "inv_trans",
      requiresItems: true,
      showVat: false,
      showDiscount: true,
      showAllocationNumber: false,
      requiresIssueDate: true,
      requiresSupplyDate: false,
      showPaymentTerms: false
    },
    payment_request: {
      label: "דרישת תשלום",
      code: "payment_req",
      requiresItems: true,
      showVat: false,
      showDiscount: true,
      showAllocationNumber: false,
      requiresIssueDate: true,
      requiresSupplyDate: false,
      showPaymentTerms: true
    },
    work_order: {
      label: "הזמנת עבודה",
      code: "work_order",
      requiresItems: true,
      showVat: false,
      showDiscount: true,
      showAllocationNumber: false,
      requiresIssueDate: true,
      requiresSupplyDate: false,
      showPaymentTerms: false
    }
  },

  unitTypes: [
    { label: "יחידה", value: "unit" },
    { label: "שעות", value: "hours" },
    { label: "שירות", value: "service" },
    { label: "פרויקט", value: "project" },
    { label: "מוצר", value: "product" },
    { label: "אחר", value: "other" }
  ],

  paymentMethods: [
    { label: "תשלום מיידי", value: "immediate" },
    { label: "העברה בנקאית", value: "bank_transfer" },
    { label: "צ'ק", value: "check" },
    { label: "מזומן", value: "cash" },
    { label: "כרטיס אשראי", value: "credit_card" }
  ],

  templates: [
    {
      id: "classic_official",
      name: "Classic Official",
      label: "קלאסי רשמי",
      description: "Clean black and white, very formal",
      usesLogo: true,
      colors: {
        primary: "#000000",
        secondary: "#333333",
        text: "#000000",
        background: "#ffffff"
      }
    },
    {
      id: "modern_green",
      name: "Modern Green",
      label: "מודרני ירוק",
      description: "Modern colored header",
      usesLogo: true,
      colors: {
        primary: "#10b981",
        secondary: "#059669",
        text: "#1f2937",
        background: "#f0fdf4"
      }
    },
    {
      id: "minimal_clean",
      name: "Minimal Clean",
      label: "מינימליסטי נקי",
      description: "Very simple, lots of white space",
      usesLogo: false,
      colors: {
        primary: "#6366f1",
        secondary: "#818cf8",
        text: "#1f2937",
        background: "#ffffff"
      }
    },
    {
      id: "color_header",
      name: "Color Header",
      label: "כותרת צבעונית",
      description: "Large colored header block",
      usesLogo: true,
      colors: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        text: "#ffffff",
        background: "#eff6ff"
      }
    }
  ],

  disclaimer: {
    en: "This tool helps create document files locally in your browser. It does not replace accounting software, certified invoicing systems, legal advice, or tax reporting. The user is responsible for document numbering, reporting, VAT correctness, and obtaining an official allocation number when required.",
    he: "כלי זה מיועד להפקת מסמכים באופן מקומי בדפדפן. הוא אינו מחליף מערכת הנהלת חשבונות, ייעוץ מס או דיווח לרשויות. האחריות על תקינות המסמך, המספור, המע״מ ומספר ההקצאה היא על המשתמש."
  }
};

export default invoiceSettings;
