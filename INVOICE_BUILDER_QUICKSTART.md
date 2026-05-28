# 🚀 Israeli Invoice Builder - Quick Start Guide

## For Users

### To Create an Invoice:

1. **Launch the Tool**
   - Click "🧾 בניית חשבוניות ודוחות עסקיים" on the home page

2. **Choose a Template**
   - Select from: Classic, Modern, Minimal, or Color Header
   - Each has a different professional look

3. **Enter Business Details**
   - Business name
   - Business type (עוסק פטור / עוסק מורשה / חברה בע״מ)
   - ID / VAT number
   - Address, phone, email
   - Bank details (for payment info)

4. **Create a Document**
   - Select document type
   - Add customer details
   - Add line items
   - Fill in dates and amount
   - Review live preview

5. **Export**
   - Download as PDF (multiple resolutions)
   - Download as PNG image
   - Export settings as JSON for next time

---

## For Developers

### Project Structure

```
src/
├── components/
│   ├── InvoiceBuilder.jsx          ← Main component (DONE)
│   ├── InvoiceBuilder.css          ← Styles (DONE)
│   ├── DocumentCreator.jsx         ← TODO
│   ├── InvoicePreview.jsx          ← TODO
│   └── SettingsPanel.jsx           ← TODO
├── config/
│   └── invoiceSettings.ts          ← Central config (READY)
├── utils/
│   └── invoiceUtils.ts             ← Utilities (DONE)
└── types/
    └── invoice.ts                  ← TypeScript types (READY)
```

### How It Works

1. **InvoiceBuilder.jsx** - Main orchestrator component
   - Manages step flow: template → business → create → preview
   - Stores business details in state
   - Passes data to child components

2. **invoiceSettings** - Global configuration
   - VAT rates, currency, labels
   - Document types, business types
   - Payment methods, unit types
   - All text in Hebrew

3. **invoiceUtils** - Business logic
   - Line item calculations
   - Invoice totals (with VAT)
   - Currency/date formatting
   - JSON import/export

4. **Templates** - Design variations
   - Classic: Black & white, formal
   - Modern: Green header, contemporary
   - Minimal: Simple, lots of white space
   - Color Header: Large colored block

---

### State Management

```jsx
// Top-level state in InvoiceBuilder component
const [step, setStep] = useState('template')
const [selectedTemplate, setSelectedTemplate] = useState('classic')
const [businessDetails, setBusinessDetails] = useState({...})
const [currentDocument, setCurrentDocument] = useState(null)
```

### Data Flow

```
User Input
    ↓
Component State
    ↓
Calculation (invoiceUtils)
    ↓
Live Preview
    ↓
Export (PDF/PNG/JSON)
```

---

### Adding Features

#### To Add a New Document Type:

1. Edit `invoiceSettings.ts`
2. Add to `documentTypes` object:
   ```js
   "new_type": {
     code: "code",
     label: "תרגום",
     requiresVat: true,
     fields: [...]
   }
   ```

#### To Add a New Template:

1. Create new component in `components/templates/`
2. Register in `invoiceSettings.ts`
3. Create CSS for the template

#### To Change VAT Rate:

1. Edit `invoiceSettings.ts`
2. Modify: `tax: { defaultVatRate: 18 }`

---

### Testing Checklist

- [ ] Template selection works
- [ ] Business form accepts input
- [ ] Form validation works
- [ ] Navigation between steps works
- [ ] Back buttons work
- [ ] RTL text displays correctly
- [ ] Mobile layout is responsive
- [ ] Data persists on page reload
- [ ] Export buttons work
- [ ] Import settings works

---

### Performance Tips

1. **Memoization**: Use React.memo for templates
2. **Lazy Loading**: Load templates on demand
3. **Virtual Scrolling**: For large item lists
4. **Web Workers**: For PDF generation (optional)

---

### Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile Safari: ✅ Full support
- IE11: ❌ Not supported

---

### Known Limitations

1. **No offline sync** - Changes only sync between tabs, not devices
2. **No cloud backup** - Backups only via JSON export
3. **No authentication** - No user accounts
4. **Browser storage limit** - ~5-10MB localStorage limit
5. **No real-time collaboration** - Single user per browser

---

### Future Enhancements

- [ ] Receipt templates
- [ ] Email delivery (via server)
- [ ] SMS reminders
- [ ] Automatic numbering
- [ ] Payment tracking
- [ ] Expense tracking
- [ ] Dashboard/reports
- [ ] Multi-language support
- [ ] Custom branding
- [ ] Batch operations

---

## Troubleshooting

**Q: Why is my data not saved?**
A: Check browser localStorage is enabled. Data is only saved on your device.

**Q: Can I use this offline?**
A: Yes! The app works entirely in your browser with no internet needed.

**Q: Is my data private?**
A: Yes! All data stays on your device. Nothing is sent to any server.

**Q: Can I share documents?**
A: Yes! Export as PDF or PNG, then share those files.

**Q: Can I edit previously saved documents?**
A: Yes! Import the JSON file to restore previous settings.

---

## Support & Feedback

Found a bug? Have a suggestion? 
Create an issue or contact the development team.

---

**Version**: 0.1.0 MVP
**Last Updated**: 2024
**Status**: Development
