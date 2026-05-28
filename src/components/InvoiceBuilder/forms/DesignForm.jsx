// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/forms/DesignForm.jsx

import React from 'react'
import invoiceSettings from '../../../config/invoiceSettings'

export default function DesignForm({
  selectedTemplate,
  onTemplateChange,
  customization,
  onCustomizationChange
}) {
  const handleCustomizationChange = (field, value) => {
    onCustomizationChange({
      ...customization,
      [field]: value
    })
  }

  return (
    <div className="form-section">
      <h2>עיצוב ותבנית</h2>

      <h3>בחר תבנית</h3>
      <div className="template-grid">
        {invoiceSettings.templates.map(template => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="template-preview" style={{
              background: template.colors.background,
              color: template.colors.text,
              borderTop: `4px solid ${template.colors.primary}`
            }}>
              <div style={{ fontSize: '0.8rem' }}>{template.label}</div>
            </div>
            <p>{template.description}</p>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '2rem' }}>התאמה אישית</h3>

      <div className="customization-grid">
        <div className="form-group">
          <label>צבע ראשי</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={customization.primaryColor}
              onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
            />
            <code>{customization.primaryColor}</code>
          </div>
        </div>

        <div className="form-group">
          <label>צבע משני</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={customization.secondaryColor}
              onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
            />
            <code>{customization.secondaryColor}</code>
          </div>
        </div>

        <div className="form-group">
          <label>צבע טקסט</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={customization.textColor}
              onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
            />
            <code>{customization.textColor}</code>
          </div>
        </div>

        <div className="form-group">
          <label>צבע רקע</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={customization.backgroundColor}
              onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
            />
            <code>{customization.backgroundColor}</code>
          </div>
        </div>

        <div className="form-group">
          <label>גופן</label>
          <select
            value={customization.fontFamily}
            onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>

        <div className="form-group">
          <label>גודל נייר</label>
          <select
            value={customization.paperSize}
            onChange={(e) => handleCustomizationChange('paperSize', e.target.value)}
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
          </select>
        </div>

        <div className="form-group">
          <label>שוליים</label>
          <select
            value={customization.margins}
            onChange={(e) => handleCustomizationChange('margins', e.target.value)}
          >
            <option value="normal">רגיל</option>
            <option value="compact">קומפקטי</option>
            <option value="wide">רחב</option>
          </select>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>אפשרויות תצוגה</h3>

      <div className="checkbox-group">
        {[
          { field: 'showWebsite', label: 'הצג אתר אינטרנט' },
          { field: 'showEmail', label: 'הצג דוא״ל' },
          { field: 'showPhone', label: 'הצג טלפון' },
          { field: 'showItemCode', label: 'הצג קוד פריט' },
          { field: 'showVatColumn', label: 'הצג עמודת מע״מ' },
          { field: 'showDiscountColumn', label: 'הצג עמודת הנחה' },
          { field: 'showSignature', label: 'הצג חתימה' },
          { field: 'showStamp', label: 'הצג חותם' },
          { field: 'showPaymentDetails', label: 'הצג פרטי בנק' },
          { field: 'showAllocationNumber', label: 'הצג מספר הקצאה' }
        ].map(({ field, label }) => (
          <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={customization[field]}
              onChange={(e) => handleCustomizationChange(field, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
