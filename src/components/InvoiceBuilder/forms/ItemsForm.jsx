// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/forms/ItemsForm.jsx

import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import invoiceSettings from '../../../config/invoiceSettings'

export default function ItemsForm({
  items,
  onChange,
  businessType,
  vatRate,
  globalDiscountType,
  globalDiscountValue,
  onGlobalDiscountChange,
  notes,
  onNotesChange,
  documentMetadata,
  onMetadataChange
}) {
  const handleAddItem = () => {
    const newItem = {
      id: uuidv4(),
      code: '',
      description: '',
      quantity: 1,
      unitType: 'unit',
      unitPrice: 0,
      discountType: 'none',
      discountValue: 0,
      vatRate: businessType === 'exempt' ? 0 : vatRate,
      order: items.length
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (id) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id, field, value) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleDuplicateItem = (id) => {
    const item = items.find(i => i.id === id)
    if (item) {
      const newItem = { ...item, id: uuidv4(), order: items.length }
      onChange([...items, newItem])
    }
  }

  return (
    <div className="form-section">
      <h2>פרטי הפריטים</h2>

      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id} className="item-row">
            <div className="item-index">{index + 1}</div>

            <div className="form-group">
              <label>קוד (אופציונלי)</label>
              <input
                type="text"
                value={item.code}
                onChange={(e) => handleUpdateItem(item.id, 'code', e.target.value)}
                placeholder="קוד פריט"
              />
            </div>

            <div className="form-group">
              <label>תיאור *</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                placeholder="תיאור הפריט"
              />
            </div>

            <div className="form-group">
              <label>כמות</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                placeholder="1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>יחידה</label>
              <select
                value={item.unitType}
                onChange={(e) => handleUpdateItem(item.id, 'unitType', e.target.value)}
              >
                {invoiceSettings.unitTypes.map(ut => (
                  <option key={ut.value} value={ut.value}>{ut.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>מחיר יחידה</label>
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>הנחה</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={item.discountType}
                  onChange={(e) => handleUpdateItem(item.id, 'discountType', e.target.value)}
                  style={{ flex: '0 0 100px' }}
                >
                  <option value="none">ללא</option>
                  <option value="percentage">%</option>
                  <option value="fixed">₪</option>
                </select>
                <input
                  type="number"
                  value={item.discountValue}
                  onChange={(e) => handleUpdateItem(item.id, 'discountValue', parseFloat(e.target.value))}
                  placeholder="0"
                  min="0"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {businessType !== 'exempt' && (
              <div className="form-group">
                <label>שיעור מע״מ</label>
                <input
                  type="number"
                  value={item.vatRate}
                  onChange={(e) => handleUpdateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            )}

            <div className="item-actions">
              <button className="btn-small" onClick={() => handleDuplicateItem(item.id)}>📋</button>
              <button className="btn-small danger" onClick={() => handleRemoveItem(item.id)}>❌</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={handleAddItem} style={{ marginBottom: '2rem' }}>
        ➕ הוסף פריט
      </button>

      <h3>הנחה כללית</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>סוג הנחה</label>
          <select
            value={globalDiscountType}
            onChange={(e) => onGlobalDiscountChange(e.target.value, globalDiscountValue)}
          >
            <option value="none">ללא</option>
            <option value="percentage">אחוז</option>
            <option value="fixed">סכום קבוע</option>
          </select>
        </div>
        <div className="form-group">
          <label>ערך הנחה</label>
          <input
            type="number"
            value={globalDiscountValue}
            onChange={(e) => onGlobalDiscountChange(globalDiscountType, parseFloat(e.target.value))}
            placeholder="0"
            min="0"
            disabled={globalDiscountType === 'none'}
          />
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>הערות</h3>
      <div className="form-group">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="הערות, תנאים, הודעה לתשלום..."
        />
      </div>
    </div>
  )
}
