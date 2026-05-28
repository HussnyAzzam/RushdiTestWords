# Israel Local Invoice Builder — Full Product & Development Specification

## 1. Project Overview

Build a browser-based invoice and business document generator for Israeli businesses.

The tool must run fully on the client side inside the user’s browser. It must not require a backend server, database, user account, login system, cloud storage, external API, or payment system.

The main purpose is to let users create professional Israeli-style business documents such as invoices, receipts, tax invoices, tax invoice/receipts, quotes, payment requests, and transaction invoices, then export them as PDF or PNG.

The default market is Israel, so the default language, layout, currency, direction, document types, tax labels, and business types must match Israeli usage.

The tool should be simple enough for non-technical users.

---

## 2. Core Principles

1. Everything runs locally in the browser.
2. No server upload.
3. No database.
4. No external API.
5. No authentication.
6. No cloud storage.
7. The user’s logo, business data, customer data, invoice data, and exported documents remain on the user’s device.
8. The default export format is PDF.
9. PNG export is also supported.
10. The user can export and import a reusable settings file in JSON format.
11. The tool must be responsive and work well on desktop, tablet, and mobile.
12. The UI should support Hebrew RTL by default.
13. The app should be structured so that tax rates, labels, currency, document types, and other numeric values are stored in a central settings/config file and can be changed later easily.

---

## 3. Default Localization

The default configuration must be optimized for Israel.

### Default values

- Language: Hebrew
- Direction: RTL
- Locale: he-IL
- Currency: Israeli New Shekel
- Currency symbol: ₪
- Date format: DD/MM/YYYY
- Number format: Israeli formatting
- Default VAT label: מע״מ
- Default VAT rate: stored in config file
- Default currency: ILS
- Default document orientation: portrait
- Default paper size: A4

### Important

Do not hard-code values such as VAT rate, currency, labels, document types, business types, or default texts directly inside UI components.

Use a central configuration file.

Example:

```ts
// src/config/invoiceSettings.ts

export const invoiceSettings = {
  locale: "he-IL",
  direction: "rtl",

  currency: {
    code: "ILS",
    symbol: "₪",
    position: "before"
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
    requiredByDefault: false
  },

  dates: {
    displayFormat: "DD/MM/YYYY"
  },

  defaultTexts: {
    notesLabel: "הערות",
    paymentTermsLabel: "תנאי תשלום",
    immediatePayment: "תשלום מיידי",
    bankTransfer: "העברה בנקאית",
    originalCopyText: "מקור",
    copyText: "העתק",
    totalToPay: "סה״כ לתשלום",
    subtotal: "סכום לפני מע״מ",
    vatAmount: "סכום מע״מ",
    discount: "הנחה"
  },

  businessTypes: {
    exempt: {
      label: "עוסק פטור",
      usesVat: false
    },
    licensed: {
      label: "עוסק מורשה",
      usesVat: true
    },
    company: {
      label: "חברה בע״מ",
      usesVat: true
    }
  }
};
```

---

## 4. Business Types

The user must choose one of the following business types:

### 4.1 עוסק פטור

This type usually does not charge VAT.

Default behavior:

- VAT disabled
- VAT fields hidden or shown as 0% depending on template settings
- Suitable document types:
  - קבלה
  - חשבון עסקה
  - הצעת מחיר
  - דרישת תשלום

### 4.2 עוסק מורשה

This type usually includes VAT.

Default behavior:

- VAT enabled
- VAT calculation visible
- Suitable document types:
  - חשבונית מס
  - קבלה
  - חשבונית מס/קבלה
  - חשבון עסקה
  - הצעת מחיר
  - דרישת תשלום

### 4.3 חברה בע״מ

This type is a company.

Default behavior:

- VAT enabled
- Company number field visible
- Suitable document types:
  - חשבונית מס
  - קבלה
  - חשבונית מס/קבלה
  - חשבון עסקה
  - הצעת מחיר
  - דרישת תשלום

---

## 5. Document Types

The app must support the following document types:

1. חשבונית מס
2. קבלה
3. חשבונית מס/קבלה
4. הצעת מחיר
5. חשבון עסקה
6. דרישת תשלום
7. הזמנת עבודה
8. תעודת משלוח — optional for later version

Each document type should control which fields are shown by default.

Example:

### חשבונית מס

Show:

- Business details
- Customer details
- Document number
- Issue date
- Supply/service date
- Line items
- Subtotal
- Discount
- VAT rate
- VAT amount
- Total
- Allocation number field
- Notes
- Payment terms

### קבלה

Show:

- Business details
- Customer details
- Receipt number
- Payment date
- Payment method
- Amount paid
- Bank transfer/check/cash/credit card fields if needed
- Notes
- Signature

### חשבונית מס/קבלה

Show combined invoice and payment fields.

### הצעת מחיר

Show quote fields:

- Quote number
- Valid until date
- Line items
- Optional images
- Terms
- Notes
- Signature

---

## 6. Required Fields

### 6.1 Business details

The form should include:

- Business name
- Business type
- Business ID / VAT number / company number
- Address
- Phone
- Email
- Website
- Logo upload
- Optional stamp image
- Optional signature image
- Bank name
- Branch number
- Account number
- IBAN — optional
- Payment instructions
- Default notes

### 6.2 Customer details

The form should include:

- Customer name
- Customer business/company ID
- Customer address
- Customer phone
- Customer email
- Contact person
- Optional customer notes

### 6.3 Document details

The form should include:

- Document type
- Document number
- Issue date
- Service/supply date
- Due date
- Payment terms
- Allocation number / מספר הקצאה
- Currency
- Language/direction, default Hebrew RTL

### 6.4 Line items

The user should be able to add multiple rows.

Each row should include:

- Item code/SKU — optional
- Description
- Quantity
- Unit type:
  - יחידה
  - שעות
  - שירות
  - פרויקט
  - מוצר
  - אחר
- Unit price
- Discount per row:
  - percentage
  - fixed amount
- VAT status per row if needed
- Row total

The user should be able to add, duplicate, remove, and reorder rows.

### 6.5 Global discount

The document should support global discount:

- Discount by percentage
- Discount by fixed amount

The discount should be applied before VAT unless the user changes the calculation mode in advanced settings.

### 6.6 Notes

Every document type must include an optional notes field.

Examples:

- הערות
- תנאי תשלום
- פרטי אספקה
- אחריות
- תודה על העסקה

---

## 7. Numbering

The app should allow manual document numbering.

Because there is no database, automatic cross-session numbering cannot be fully reliable unless stored locally on the user’s device.

Support:

1. Manual document number
2. Local browser numbering using localStorage — optional toggle
3. Import/export settings should include last used numbers only if the user chooses so

Important warning:

Show a small note that the user is responsible for legal numbering continuity.

---

## 8. Allocation Number — מספר הקצאה

Add a dedicated field called:

מספר הקצאה

Behavior:

- Optional by default
- Visible for VAT-related documents
- Can be enabled/disabled from settings
- Manually entered by user
- Not generated by the app
- Not requested from any API

Add a clear note:

This tool does not request an official allocation number from the Israeli Tax Authority. The user must obtain and enter it manually when required.

---

## 9. Calculations

All calculations must be client-side.

### Calculation flow

For each line:

1. quantity × unit price = gross row base
2. apply row discount
3. calculate row subtotal
4. calculate VAT if applicable
5. calculate row total

For document summary:

1. subtotal before global discount
2. row discounts total
3. global discount
4. subtotal after discount
5. VAT amount
6. total including VAT
7. amount paid, if receipt-related document
8. balance due, if relevant

### Business type logic

If business type is עוסק פטור:

- VAT rate = 0
- VAT fields hidden or disabled
- Total = subtotal after discount

If business type is עוסק מורשה or חברה בע״מ:

- VAT enabled by default
- VAT rate loaded from config

---

## 10. Templates

The app must support multiple visual templates.

### Template requirements

Each template must use the same data model but different visual design.

Templates should be selectable from a gallery.

Each template card should show:

- Template preview
- Template name
- Best use case
- Select button

### Initial templates

Build at least 4 templates:

#### 10.1 Classic Official

- Clean black and white
- Very formal
- Suitable for accountants and traditional businesses

#### 10.2 Modern Green

- Modern colored header
- Good for service providers and consultants

#### 10.3 Minimal Clean

- Very simple
- Lots of white space
- Good for freelancers

#### 10.4 Color Header

- Large colored header block
- Logo support
- Business details in header

### Later templates

Add later:

- A5 receipt
- Quote with images
- Premium branded template
- Compact template
- Colorful business template

---

## 11. Template Customization

The user should be able to customize templates.

Options:

- Primary color
- Secondary color
- Text color
- Background color
- Font family
- Logo position
- Header style
- Footer text
- Show/hide business website
- Show/hide email
- Show/hide phone
- Show/hide item code
- Show/hide VAT column
- Show/hide discount column
- Show/hide signature
- Show/hide stamp
- Show/hide payment details
- Show/hide allocation number
- Paper size:
  - A4
  - A5
- Margins:
  - normal
  - compact
  - wide

---

## 12. Logo, Signature, and Stamp Uploads

The user can upload:

- Logo
- Signature
- Stamp

Important:

These files must not be uploaded to any server.

Use browser FileReader API.

Store them temporarily in memory.

When exporting settings, optionally include the images as Base64 inside the exported JSON file.

Add image controls:

- Resize
- Remove
- Replace
- Position
- Preview

---

## 13. Export Features

### 13.1 PDF Export

Default export format is PDF.

PDF should be generated inside the browser.

Suggested libraries:

- pdf-lib
- jsPDF
- html2canvas/html-to-image combined with jsPDF

PDF export should preserve:

- RTL layout
- Hebrew text
- Logo
- Tables
- Colors
- Signature
- Stamp
- Notes

### 13.2 PNG Export

The user can export the invoice as PNG.

Suggested libraries:

- html-to-image
- dom-to-image-more

### 13.3 Share

Use Web Share API when available.

Supported actions:

- Share PDF
- Share PNG
- Share text summary
- Open email draft using mailto
- Open WhatsApp share link

Important:

Sharing files through Web Share API depends on browser/device support.

Fallback:

- Download file
- Copy summary text
- Open WhatsApp with text only

---

## 14. Import/Export Settings

This is a key feature.

### Export settings

The user can export a reusable JSON file.

File name example:

my-business-invoice-settings.json

This file should include:

- Business details
- Business type
- Logo if user chooses
- Stamp if user chooses
- Signature if user chooses
- Selected template
- Template customization
- Default payment terms
- Default notes
- Default bank details
- Default VAT settings
- Default document type
- Optional last used document numbers

### Import settings

The user can import the JSON file later.

After import:

- Business details are filled automatically
- Template is restored
- Colors are restored
- Logo is restored if included
- User only changes customer details and line items

### Privacy message

Show:

Your data is processed locally in your browser. No files are uploaded to our server.

---

## 15. Optional Local Save

Optional feature:

Allow the user to save settings locally using localStorage.

This must be presented clearly:

- Save on this device
- Clear saved data
- Export backup

Do not rely on localStorage as the only backup method.

---

## 16. UI/UX Structure

### Main layout

Use a clean wizard + live preview layout.

On desktop:

- Left side: form/wizard
- Right side: live document preview

On mobile:

- Tabs:
  - Details
  - Items
  - Design
  - Preview
  - Export

### Main navigation

Top bar:

- App name
- New document
- Import settings
- Export settings
- Help
- Language switch — optional later

### Wizard steps

1. Business type
2. Document type
3. Business details
4. Customer details
5. Items/services
6. Payment and notes
7. Design
8. Preview and export

Each step should have:

- Clear title
- Short explanation
- Next/back buttons
- Save locally button if enabled

---

## 17. Non-Technical User Experience

The app must avoid technical language.

Use simple labels and helper texts.

Examples:

Instead of:

"Upload Base64 asset"

Use:

"העלאת לוגו"

Instead of:

"Configure VAT logic"

Use:

"הגדרות מע״מ"

Use tooltips for complex fields:

- מספר הקצאה
- מע״מ
- ח.פ
- עוסק פטור
- חשבונית מס/קבלה

---

## 18. Responsive Design

The app must support:

- Desktop
- Laptop
- Tablet
- Mobile

Mobile requirements:

- Large input fields
- Sticky export button
- Easy item adding
- Collapsible item rows
- Preview zoom
- Horizontal scrolling table only if necessary
- Touch-friendly buttons

---

## 19. Data Model

Create a clear TypeScript data model.

Example:

```ts
export type BusinessType = "exempt" | "licensed" | "company";

export type DocumentType =
  | "tax_invoice"
  | "receipt"
  | "tax_invoice_receipt"
  | "quote"
  | "transaction_invoice"
  | "payment_request"
  | "work_order"
  | "delivery_note";

export interface BusinessDetails {
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
}

export interface CustomerDetails {
  name: string;
  idNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface InvoiceItem {
  id: string;
  code?: string;
  description: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  discountType?: "none" | "percentage" | "fixed";
  discountValue?: number;
  vatRate?: number;
}

export interface DocumentData {
  documentType: DocumentType;
  documentNumber: string;
  allocationNumber?: string;
  issueDate: string;
  supplyDate?: string;
  dueDate?: string;
  business: BusinessDetails;
  customer: CustomerDetails;
  items: InvoiceItem[];
  globalDiscountType?: "none" | "percentage" | "fixed";
  globalDiscountValue?: number;
  notes?: string;
  paymentTerms?: string;
  currency: string;
  vatRate: number;
  templateId: string;
}
```

---

## 20. Suggested Technical Stack

Use:

- React
- TypeScript
- Vite or Next.js static export
- Tailwind CSS
- react-hook-form
- zod
- nanoid or crypto.randomUUID
- pdf-lib or jsPDF
- html-to-image
- date-fns
- FileReader API
- localStorage only for optional local save
- Web Share API

No backend.

---

## 21. Suggested Folder Structure

```txt
src/
  app/
  components/
    forms/
    preview/
    templates/
    ui/
  config/
    invoiceSettings.ts
    documentTypes.ts
    businessTypes.ts
  lib/
    calculations.ts
    exportPdf.ts
    exportPng.ts
    importExportSettings.ts
    formatters.ts
    validators.ts
  types/
    invoice.ts
  templates/
    ClassicOfficial.tsx
    ModernGreen.tsx
    MinimalClean.tsx
    ColorHeader.tsx
  data/
    defaultInvoiceData.ts
```

---

## 22. Components

### Core components

- AppShell
- InvoiceWizard
- BusinessTypeSelector
- DocumentTypeSelector
- BusinessDetailsForm
- CustomerDetailsForm
- ItemsTable
- PaymentDetailsForm
- NotesForm
- TemplateSelector
- TemplateCustomizer
- InvoicePreview
- ExportPanel
- ImportSettingsButton
- ExportSettingsButton
- LogoUploader
- SignatureUploader
- StampUploader

### UI components

- Button
- Input
- Select
- Textarea
- Checkbox
- Toggle
- Card
- Modal
- Tooltip
- Tabs
- Accordion

---

## 23. Validation

Use zod or equivalent.

Validation examples:

Business name required.

Document number required.

Issue date required.

At least one item required for invoice/quote/payment request.

Item description required.

Quantity must be greater than 0.

Unit price must be 0 or greater.

VAT must be 0 or greater.

Email must be valid if entered.

---

## 24. Accessibility

Support:

- Keyboard navigation
- Good color contrast
- Labels for all inputs
- Clear error messages
- Large buttons
- RTL-friendly layout

---

## 25. Legal/Compliance Disclaimer

Add a visible but non-intrusive disclaimer:

This tool helps create document files locally in your browser. It does not replace accounting software, certified invoicing systems, legal advice, or tax reporting. The user is responsible for document numbering, reporting, VAT correctness, and obtaining an official allocation number when required.

Hebrew version:

כלי זה מיועד להפקת מסמכים באופן מקומי בדפדפן. הוא אינו מחליף מערכת הנהלת חשבונות, ייעוץ מס או דיווח לרשויות. האחריות על תקינות המסמך, המספור, המע״מ ומספר ההקצאה היא על המשתמש.

---

## 26. MVP Scope

Build the first version with:

1. Hebrew RTL interface
2. Israeli defaults
3. Business type selector:
   - עוסק פטור
   - עוסק מורשה
   - חברה בע״מ
4. Document types:
   - חשבונית מס
   - קבלה
   - חשבונית מס/קבלה
   - הצעת מחיר
5. Business details form
6. Customer details form
7. Dynamic line items
8. VAT calculation
9. Discount by percentage or fixed amount
10. Optional notes
11. Manual allocation number
12. Logo upload
13. 4 templates
14. Live preview
15. PDF export
16. PNG export
17. Export settings JSON
18. Import settings JSON
19. Responsive design
20. Central settings file for VAT, currency, labels, and numeric values

---

## 27. Future Features

Later versions can include:

- Local document history
- Duplicate document
- Quote to invoice conversion
- Multiple languages
- English/Arabic interface
- More templates
- Payment QR
- Bank transfer QR
- PDF page break optimization
- A5 receipt template
- Product/service presets stored locally
- Customer presets stored locally
- CSV import for line items
- Bulk document generation from CSV
- Print directly
- Dark mode

---

## 28. Important Development Rules

1. Do not use any backend.
2. Do not create server routes.
3. Do not connect to external APIs.
4. Do not upload user files anywhere.
5. Keep all data in browser memory unless user chooses local save.
6. Use a central config file for all values that may change later.
7. Make the UI simple for non-technical users.
8. Keep the default experience Israeli and Hebrew RTL.
9. Make PDF export the default action.
10. Make the app easy to extend later.
