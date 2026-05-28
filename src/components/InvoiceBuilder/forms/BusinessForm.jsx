// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/forms/BusinessForm.jsx

import React from 'react'

export default function BusinessForm({ business, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...business,
      [field]: value
    })
  }

  const handleBankChange = (field, value) => {
    onChange({
      ...business,
      bankDetails: {
        ...business.bankDetails,
        [field]: value
      }
    })
  }

  return (
    <div className="form-section">
      <h2>פרטי העסק</h2>

      <div className="form-group">
        <label>שם העסק *</label>
        <input
          type="text"
          value={business.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="הזן שם העסק"
        />
      </div>

      <div className="form-group">
        <label>מספר זהות / ח.פ / מספר חברה *</label>
        <input
          type="text"
          value={business.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          placeholder="הזן מספר הזהות או ח.פ"
        />
      </div>

      <div className="form-group">
        <label>כתובת</label>
        <textarea
          value={business.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="הזן כתובת"
        />
      </div>

      <div className="form-group">
        <label>טלפון</label>
        <input
          type="tel"
          value={business.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="הזן מספר טלפון"
        />
      </div>

      <div className="form-group">
        <label>דוא״ל</label>
        <input
          type="email"
          value={business.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="הזן דוא״ל"
        />
      </div>

      <div className="form-group">
        <label>אתר אינטרנט</label>
        <input
          type="url"
          value={business.website}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <h3 style={{ marginTop: '2rem' }}>פרטי בנק</h3>

      <div className="form-group">
        <label>שם הבנק</label>
        <input
          type="text"
          value={business.bankDetails?.bankName || ''}
          onChange={(e) => handleBankChange('bankName', e.target.value)}
          placeholder="שם הבנק"
        />
      </div>

      <div className="form-group">
        <label>מספר סניף</label>
        <input
          type="text"
          value={business.bankDetails?.branchNumber || ''}
          onChange={(e) => handleBankChange('branchNumber', e.target.value)}
          placeholder="מספר סניף"
        />
      </div>

      <div className="form-group">
        <label>מספר חשבון</label>
        <input
          type="text"
          value={business.bankDetails?.accountNumber || ''}
          onChange={(e) => handleBankChange('accountNumber', e.target.value)}
          placeholder="מספר חשבון"
        />
      </div>

      <div className="form-group">
        <label>IBAN</label>
        <input
          type="text"
          value={business.bankDetails?.iban || ''}
          onChange={(e) => handleBankChange('iban', e.target.value)}
          placeholder="IBAN"
        />
      </div>

      <div className="form-group">
        <label>הערות ברירת מחדל</label>
        <textarea
          value={business.defaultNotes || ''}
          onChange={(e) => handleChange('defaultNotes', e.target.value)}
          placeholder="הערות שיופיעו בכל חשבונית"
        />
      </div>
    </div>
  )
}
