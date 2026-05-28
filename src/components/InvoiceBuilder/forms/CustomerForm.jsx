// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/forms/CustomerForm.jsx

import React from 'react'

export default function CustomerForm({ customer, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...customer,
      [field]: value
    })
  }

  return (
    <div className="form-section">
      <h2>פרטי הלקוח</h2>

      <div className="form-group">
        <label>שם הלקוח *</label>
        <input
          type="text"
          value={customer.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="הזן שם הלקוח או החברה"
        />
      </div>

      <div className="form-group">
        <label>מספר זהות / ח.פ</label>
        <input
          type="text"
          value={customer.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          placeholder="הזן מספר זהות או ח.פ של הלקוח"
        />
      </div>

      <div className="form-group">
        <label>כתובת</label>
        <textarea
          value={customer.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="הזן כתובת הלקוח"
        />
      </div>

      <div className="form-group">
        <label>טלפון</label>
        <input
          type="tel"
          value={customer.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="הזן מספר טלפון"
        />
      </div>

      <div className="form-group">
        <label>דוא״ל</label>
        <input
          type="email"
          value={customer.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="הזן דוא״ל"
        />
      </div>

      <div className="form-group">
        <label>איש קשר</label>
        <input
          type="text"
          value={customer.contactPerson}
          onChange={(e) => handleChange('contactPerson', e.target.value)}
          placeholder="שם איש הקשר"
        />
      </div>

      <div className="form-group">
        <label>הערות</label>
        <textarea
          value={customer.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="הערות על הלקוח או ההזמנה"
        />
      </div>
    </div>
  )
}
