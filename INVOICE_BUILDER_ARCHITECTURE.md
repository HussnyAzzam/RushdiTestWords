# 🏗️ Invoice Builder - Architecture Diagrams

## Component Hierarchy

```
App.jsx
├── Home.jsx
│   └── Button: "בניית חשבוניות" (🧾)
│
└── InvoiceBuilder.jsx (NEW)
    ├── Step 1: TemplateSelection
    │   ├── TemplateCard[] (4 templates)
    │   └── Continue Button
    │
    ├── Step 2: BusinessSetup
    │   ├── BusinessForm
    │   │   ├── Business Name Input
    │   │   ├── Business Type Select
    │   │   ├── ID/VAT Input
    │   │   ├── Address Input
    │   │   ├── Phone Input
    │   │   ├── Email Input
    │   │   ├── Website Input
    │   │   ├── Bank Name Input
    │   │   ├── Branch Number Input
    │   │   └── Account Number Input
    │   ├── Back Button
    │   └── Continue Button
    │
    ├── Step 3: DocumentCreator (TODO)
    │   ├── DocumentType Selector
    │   ├── CustomerDetailsForm
    │   ├── LineItemsForm
    │   ├── InvoiceSettings
    │   └── PreviewPane
    │
    ├── Step 4: InvoicePreview (TODO)
    │   ├── TemplateRenderer
    │   ├── SettingsPanel
    │   ├── ExportOptions
    │   └── PrintButton
    │
    └── Supporting Services
        ├── invoiceSettings.ts
        │   ├── Central config
        │   ├── All defaults
        │   └── Localization
        │
        ├── invoiceUtils.ts
        │   ├── Calculations
        │   ├── Formatting
        │   └── Import/Export
        │
        └── invoice.ts (Types)
            ├── BusinessDetails
            ├── InvoiceDocument
            ├── LineItem
            └── Other types
```

---

## Data Flow

```
User Input (Form)
    ↓
    ├─→ State Update (React.useState)
    ├─→ Form Validation
    │
    ↓
Business Details / Document Data
    ↓
    ├─→ invoiceCalculations()
    ├─→ formatCurrency()
    ├─→ formatDate()
    │
    ↓
Formatted Output
    ↓
    ├─→ Live Preview (Phase 3)
    ├─→ Calculations Display
    ├─→ Totals Display
    │
    ↓
Export Options (Phase 4)
    ├─→ PDF Export (jsPDF)
    ├─→ PNG Export (html2canvas)
    ├─→ JSON Export (settings)
    │
    ↓
Download / Share
```

---

## State Management

```
InvoiceBuilder Component
│
├── State Variables:
│   ├── step: "template" | "business" | "create" | "preview"
│   ├── selectedTemplate: string
│   ├── businessDetails: BusinessDetails object
│   ├── currentDocument: InvoiceDocument object (TODO)
│   ├── lineItems: LineItem[] array (TODO)
│   └── formErrors: Record<string, string> (TODO)
│
├── Handlers:
│   ├── handleBusinessChange(field, value)
│   ├── handleAddLineItem() (TODO)
│   ├── handleRemoveLineItem() (TODO)
│   ├── handleUpdateLineItem() (TODO)
│   ├── handleCalculateTotals() (TODO)
│   └── handleExport() (TODO)
│
└── Effects:
    ├── useEffect(() => saveToLocalStorage()) (TODO)
    ├── useEffect(() => loadFromLocalStorage()) (TODO)
    └── useEffect(() => validateForm()) (TODO)
```

---

## Calculation Pipeline

```
Line Items
    ↓
For each line item:
├── Quantity × Unit Price = Gross Row
├── Apply Row Discount:
│   ├── If % discount: Gross × (discount / 100)
│   └── If Fixed: use discount value
├── Row Total = Gross - Row Discount
└── Store in calculations
    ↓
Sum all row totals:
├── Subtotal = Sum(Row Totals)
├── Apply Global Discount:
│   ├── If % discount: Subtotal × (discount / 100)
│   └── If Fixed: use discount value
├── Subtotal After Discount = Subtotal - Global Discount
├── VAT Calculation:
│   └── VAT Amount = Subtotal After × (VAT Rate / 100)
└── Final Total = Subtotal After + VAT Amount
    ↓
Return object:
{
  subtotal,
  globalDiscount,
  subtotalAfterDiscount,
  vatAmount,
  total
}
```

---

## Business Type Rules

```
User selects Business Type
    ↓
    ├─→ עוסק פטור (Exempt)
    │   ├── VAT Disabled (0%)
    │   ├── No VAT fields shown
    │   └── Suitable docs: קבלה, חשבון עסקה
    │
    ├─→ עוסק מורשה (Licensed)
    │   ├── VAT Enabled (18% default)
    │   ├── VAT fully calculated
    │   └── All document types available
    │
    └─→ חברה בע״מ (Company)
        ├── VAT Enabled (18% default)
        ├── Company number required
        ├── All document types available
        └── Extra company fields shown
```

---

## Document Type Rules

```
Document Type Selection
    ↓
    ├─→ חשבונית מס (Tax Invoice)
    │   ├── Requires VAT
    │   ├── Shows: Doc#, dates, items, VAT, total
    │   └── Allocation# required
    │
    ├─→ קבלה (Receipt)
    │   ├── No VAT required
    │   ├── Shows: Payment method, amount paid
    │   └── Optional: Signature
    │
    ├─→ חשבונית מס/קבלה (Combined)
    │   ├── Invoice + Payment fields
    │   ├── Shows: VAT, balance due
    │   └── Full fields
    │
    ├─→ הצעת מחיר (Quote)
    │   ├── No VAT
    │   ├── Shows: Valid until date
    │   └── Optional: Terms & conditions
    │
    ├─→ חשבון עסקה (Transaction)
    │   ├── No VAT
    │   ├── Simplified fields
    │   └── Basic totals
    │
    ├─→ דרישת תשלום (Payment Request)
    │   ├── Shows: Amount, due date
    │   ├── Payment terms
    │   └── Minimal fields
    │
    └─→ הזמנת עבודה (Work Order)
        ├── No VAT
        ├── Shows: Items/tasks
        └── Optional: Signature
```

---

## UI Layout (Responsive)

```
DESKTOP (1024px+)
┌─────────────────────────────────────┐
│  InvoiceBuilder Header              │
├─────────────────────────────────────┤
│                                     │
│  [Template] [Business] [Document]   │  ← Step indicators
│                                     │
├─────────────────────────────────────┤
│  Step Content (form or display)     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │   Form or Content Area          ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [← Back]                  [Next →] │  ← Navigation
└─────────────────────────────────────┘

TABLET (768-1024px)
┌──────────────────────────┐
│  InvoiceBuilder Header   │
├──────────────────────────┤
│  Step Content            │
│  (form or content)       │
│                          │
│  [← Back]    [Next →]    │
└──────────────────────────┘

MOBILE (< 768px)
┌──────────────┐
│  Back | Logo │
├──────────────┤
│ Header/Title │
├──────────────┤
│ Content Area │
│ (full width) │
│              │
├──────────────┤
│ [Button]     │
│ [Button]     │
└──────────────┘
```

---

## File Organization

```
src/
├── components/
│   ├── InvoiceBuilder/
│   │   ├── InvoiceBuilder.jsx          ✅ Main component
│   │   ├── InvoiceBuilder.css          ✅ Styles
│   │   ├── TemplateSelector.jsx        (future)
│   │   ├── BusinessSetup.jsx           (future)
│   │   ├── DocumentCreator.jsx         (future)
│   │   └── InvoicePreview.jsx          (future)
│   │
│   └── [Other components...]
│
├── config/
│   └── invoiceSettings.ts              ✅ Central config
│
├── utils/
│   └── invoiceUtils.ts                 ✅ Calculations
│
├── types/
│   └── invoice.ts                      ✅ TypeScript types
│
└── [Other files...]
```

---

## API Reference (invoiceUtils.ts)

```typescript
// Calculations
calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number

calculateInvoiceTotals(
  items: LineItem[],
  globalDiscount: number,
  globalDiscountType: 'percentage' | 'fixed',
  vatRate: number
): InvoiceTotals

// Formatting
formatCurrency(amount: number, symbol?: string): string
formatDate(date: string | Date, format?: string): string

// Import/Export
exportToJSON(data: any): void
importFromJSON(file: File): Promise<any>
```

---

## Configuration Object (invoiceSettings.ts)

```typescript
invoiceSettings {
  locale: "he-IL"
  direction: "rtl"
  
  currency: {
    code: "ILS"
    symbol: "₪"
    position: "before"
  }
  
  tax: {
    vatName: "מע״מ"
    defaultVatRate: 18
    exemptBusinessVatRate: 0
  }
  
  businessTypes: {
    exempt: {...}
    licensed: {...}
    company: {...}
  }
  
  documentTypes: {
    "חשבונית מס": {...}
    "קבלה": {...}
    // ... 7 types total
  }
  
  [And many more configuration options...]
}
```

---

## Phase Progression

```
Phase 1: MVP Core (✅ COMPLETE)
├── InvoiceBuilder component
├── Template selection
├── Business setup form
├── Document type selector
└── Basic infrastructure

        ↓↓↓

Phase 2: Document Creator (🚀 NEXT)
├── Line items form
├── Customer details
├── Date pickers
├── All input fields
└── Form validation

        ↓↓↓

Phase 3: Live Preview
├── Template renderers
├── Real-time preview
├── Color customization
└── Print preview

        ↓↓↓

Phase 4: Export Functions
├── PDF export (jsPDF)
├── PNG export (html2canvas)
├── JSON export
└── Multiple resolutions

        ↓↓↓

Phase 5: Settings & Persistence
├── LocalStorage
├── Auto-numbering
├── Settings panel
└── Backup/restore

        ↓↓↓

Phase 6: Advanced Features (Future)
├── Batch operations
├── Integrations
├── Reporting
└── Mobile PWA
```

---

## Technology Stack

```
Core:
├── React 18.2.0 (UI Framework)
├── TypeScript (Type Safety)
└── React Router v7 (Navigation)

Styling:
├── CSS3 (Responsive Design)
├── Flexbox & Grid
└── CSS Animations

Export:
├── jsPDF 4.2.1 (PDF Generation)
├── html2canvas 1.4.1 (Screenshot)
└── Browser APIs (PNG)

Build:
├── Vite 8.0.9 (Bundler)
└── NPM (Package Manager)
```

---

## Browser Compatibility

```
✅ Chrome/Edge 90+       Desktop & Mobile
✅ Firefox 88+           Desktop & Mobile
✅ Safari 14+            Desktop & Mobile
✅ Mobile Safari (iOS)   iPad & iPhone
✅ Samsung Internet      Android Devices

❌ Internet Explorer     Not supported
```

---

**Last Updated**: 2024
**Maintainer**: Development Team
