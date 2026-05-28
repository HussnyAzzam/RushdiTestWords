// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/forms/DocumentDetailsForm.jsx

import React from 'react'

export default function DocumentDetailsForm({ metadata, onChange, documentType, businessType }) {
  const handleChange = (field, value) => {
    onChange({
      ...metadata,
      [field]: value
    })
  }

  const showAllocationNumber = businessType !== 'exempt'
  const showSupplyDate = ['tax_invoice', 'tax_invoice_receipt'].includes(documentType)

  return (
    <div className="form-section">
      <h2>פרטי המסמך</h2>

      <div className="form-group">
        <label>מספר מסמך *</label>
        <input
          type="text"
          value={metadata.documentNumber}
          onChange={(e) => handleChange('documentNumber', e.target.value)}
          placeholder="הזן מספר מסמך"
        />
        <small>אתה אחראי על המספור החוקי</small>
      </div>

      <div className="form-group">
        <label>תאריך הנפקה *</label>
        <input
          type="date"
          value={metadata.issueDate}
          onChange={(e) => handleChange('issueDate', e.target.value)}
        />
      </div>

      {showSupplyDate && (
        <div className="form-group">
          <label>תאריך אספקה / ביצוע</label>
          <input
            type="date"
            value={metadata.supplyDate}
            onChange={(e) => handleChange('supplyDate', e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label>תאריך הקבלה</label>
        <input
          type="date"
          value={metadata.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>

      {showAllocationNumber && (
        <div className="form-group">
          <label>מספר הקצאה</label>
          <input
            type="text"
            value={metadata.allocationNumber}
            onChange={(e) => handleChange('allocationNumber', e.target.value)}
            placeholder="מספר הקצאה מהרשויות"
          />
          <small>כלי זה אינו מבקש מספר הקצאה רשמי. עליך להשיג זאת בעצמך מהרשויות.</small>
        </div>
      )}

      <div className="form-group">
        <label>תנאי תשלום</label>
        <input
          type="text"
          value={metadata.paymentTerms}
          onChange={(e) => handleChange('paymentTerms', e.target.value)}
          placeholder="תנאי תשלום"
        />
      </div>

      <div className="form-group">
        <label>שיעור מע״מ</label>
        <input
          type="number"
          value={metadata.vatRate}
          onChange={(e) => handleChange('vatRate', parseFloat(e.target.value))}
          placeholder="0"
          min="0"
          max="100"
          step="0.1"
        />
        <small>אחוז מע״מ</small>
      </div>
    </div>
  )
}
