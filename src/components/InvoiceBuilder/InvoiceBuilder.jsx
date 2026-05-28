// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/InvoiceBuilder/InvoiceBuilder.jsx

import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import invoiceSettings from '../../config/invoiceSettings'
import InvoiceCalculations from '../../lib/invoiceCalculations'
import InvoiceImportExport from '../../lib/invoiceImportExport'
import InvoicePDFExport from '../../lib/invoicePDFExport'
import BusinessForm from './forms/BusinessForm'
import CustomerForm from './forms/CustomerForm'
import DocumentDetailsForm from './forms/DocumentDetailsForm'
import ItemsForm from './forms/ItemsForm'
import DesignForm from './forms/DesignForm'
import InvoicePreview from './preview/InvoicePreview'
import './InvoiceBuilder.css'

export default function InvoiceBuilder({ onBack }) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState('rtl')

  // Business data
  const [businessDetails, setBusinessDetails] = useState({
    id: uuidv4(),
    name: '',
    type: 'licensed',
    idNumber: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    bankDetails: {}
  })

  // Customer data
  const [customerDetails, setCustomerDetails] = useState({
    id: uuidv4(),
    name: '',
    idNumber: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  })

  // Document metadata
  const [documentMetadata, setDocumentMetadata] = useState({
    documentType: 'tax_invoice',
    documentNumber: '1',
    issueDate: new Date().toISOString().slice(0, 10),
    supplyDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    paymentTerms: 'תשלום מיידי',
    allocationNumber: '',
    currency: 'ILS',
    vatRate: invoiceSettings.tax.defaultVatRate
  })

  // Items
  const [items, setItems] = useState([])

  // Global discount
  const [globalDiscountType, setGlobalDiscountType] = useState('none')
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0)

  // Notes
  const [notes, setNotes] = useState('')

  // Design/Template
  const [selectedTemplate, setSelectedTemplate] = useState('classic_official')
  const [templateCustomization, setTemplateCustomization] = useState({
    primaryColor: '#000000',
    secondaryColor: '#333333',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial',
    logoPosition: 'top-left',
    headerStyle: 'simple',
    showWebsite: true,
    showEmail: true,
    showPhone: true,
    showItemCode: true,
    showVatColumn: true,
    showDiscountColumn: true,
    showSignature: false,
    showStamp: false,
    showPaymentDetails: true,
    showAllocationNumber: true,
    paperSize: 'A4',
    margins: 'normal'
  })

  // Calculations
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    rowDiscounts: 0,
    globalDiscount: 0,
    subtotalAfterDiscount: 0,
    vatAmount: 0,
    total: 0
  })

  // UI state
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const previewRef = useRef(null)

  // Calculate totals when items or discounts change
  useEffect(() => {
    const calcs = InvoiceCalculations.calculateDocumentTotals(
      items,
      globalDiscountType,
      globalDiscountValue,
      businessDetails.type
    )
    setCalculations(calcs)
  }, [items, globalDiscountType, globalDiscountValue, businessDetails.type])

  // Handlers
  const handleExportSettings = () => {
    try {
      InvoiceImportExport.exportSettings(
        businessDetails,
        documentMetadata.documentType,
        selectedTemplate,
        documentMetadata.paymentTerms,
        notes,
        true
      )
      setSuccess('הגדרות יוצאו בהצלחה')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleImportSettings = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const settings = await InvoiceImportExport.importSettings(file)
      setBusinessDetails(settings.business)
      setDocumentMetadata(prev => ({
        ...prev,
        documentType: settings.defaultDocumentType,
        paymentTerms: settings.defaultPaymentTerms || prev.paymentTerms
      }))
      setSelectedTemplate(settings.defaultTemplateId)
      setNotes(settings.defaultNotes || '')
      setSuccess('הגדרות יובאו בהצלחה')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleExportPDF = async () => {
    if (!previewRef.current) {
      setError('לא ניתן למצוא את תיבת התצוגה המקדימה')
      return
    }

    setLoading(true)
    try {
      await InvoicePDFExport.exportPDF(
        previewRef.current,
        {
          id: uuidv4(),
          metadata: documentMetadata,
          business: businessDetails,
          customer: customerDetails,
          items,
          globalDiscountType,
          globalDiscountValue,
          notes,
          calculations,
          templateId: selectedTemplate,
          templateCustomization,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        },
        `חשבונית-${documentMetadata.documentNumber}.pdf`
      )
      setSuccess('ה-PDF יוצא בהצלחה')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPNG = async () => {
    if (!previewRef.current) {
      setError('לא ניתן למצוא את תיבת התצוגה המקדימה')
      return
    }

    setLoading(true)
    try {
      await InvoicePDFExport.exportPNG(
        previewRef.current,
        {
          id: uuidv4(),
          metadata: documentMetadata,
          business: businessDetails,
          customer: customerDetails,
          items,
          globalDiscountType,
          globalDiscountValue,
          notes,
          calculations,
          templateId: selectedTemplate,
          templateCustomization,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        },
        `חשבונית-${documentMetadata.documentNumber}.png`
      )
      setSuccess('ה-PNG יוצא בהצלחה')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (!previewRef.current) {
      setError('לא ניתן למצוא את תיבת התצוגה המקדימה')
      return
    }

    try {
      InvoicePDFExport.printDocument(previewRef.current, documentMetadata.documentNumber)
      setSuccess('חלון ההדפסה נפתח')
    } catch (err) {
      setError(err.message)
    }
  }

  // ...rest of component to be continued...

  return (
    <div className="invoice-builder" dir={direction}>
      <button className="back-btn" onClick={onBack}>← חזור</button>

      <div className="invoice-header">
        <h1>📄 בנאי חשבוניות ישראלי</h1>
        <p>צור חשבוניות מקצועיות ישירות בדפדפן שלך</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="invoice-container">
        {/* Left Panel - Form */}
        <div className="invoice-form-panel">
          <div className="wizard-nav">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <button
                key={step}
                className={`wizard-step ${currentStep === step ? 'active' : ''}`}
                onClick={() => setCurrentStep(step)}
              >
                {step}
              </button>
            ))}
          </div>

          <div className="wizard-content">
            {currentStep === 1 && (
              <div>
                <h2>סוג העסק</h2>
                <div className="form-group">
                  <label>בחר סוג עסק</label>
                  <select
                    value={businessDetails.type}
                    onChange={(e) =>
                      setBusinessDetails({ ...businessDetails, type: e.target.value })
                    }
                  >
                    {Object.entries(invoiceSettings.businessTypes).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2>סוג מסמך</h2>
                <div className="form-group">
                  <label>בחר סוג מסמך</label>
                  <select
                    value={documentMetadata.documentType}
                    onChange={(e) =>
                      setDocumentMetadata({ ...documentMetadata, documentType: e.target.value })
                    }
                  >
                    {Object.entries(invoiceSettings.documentTypes).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <BusinessForm
                business={businessDetails}
                onChange={setBusinessDetails}
              />
            )}

            {currentStep === 4 && (
              <CustomerForm
                customer={customerDetails}
                onChange={setCustomerDetails}
              />
            )}

            {currentStep === 5 && (
              <ItemsForm
                items={items}
                onChange={setItems}
                businessType={businessDetails.type}
                vatRate={documentMetadata.vatRate}
                globalDiscountType={globalDiscountType}
                globalDiscountValue={globalDiscountValue}
                onGlobalDiscountChange={(type, value) => {
                  setGlobalDiscountType(type)
                  setGlobalDiscountValue(value)
                }}
                notes={notes}
                onNotesChange={setNotes}
                documentMetadata={documentMetadata}
                onMetadataChange={setDocumentMetadata}
              />
            )}

            {currentStep === 6 && (
              <DesignForm
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                customization={templateCustomization}
                onCustomizationChange={setTemplateCustomization}
              />
            )}

            {currentStep === 7 && (
              <div>
                <h2>ייצוא וסיום</h2>
                <div className="export-buttons">
                  <button className="btn btn-primary" onClick={handleExportPDF} disabled={loading}>
                    📥 ייצוא PDF
                  </button>
                  <button className="btn btn-primary" onClick={handleExportPNG} disabled={loading}>
                    📸 ייצוא PNG
                  </button>
                  <button className="btn btn-secondary" onClick={handlePrint}>
                    🖨️ הדפס
                  </button>
                  <button className="btn btn-secondary" onClick={handleExportSettings}>
                    💾 ייצוא הגדרות
                  </button>
                  <label className="btn btn-secondary">
                    📂 ייבוא הגדרות
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="wizard-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              ← הקודם
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
              disabled={currentStep === 7}
            >
              הבא →
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="invoice-preview-panel">
          <h3>תצוגה מקדימה</h3>
          <InvoicePreview
            ref={previewRef}
            business={businessDetails}
            customer={customerDetails}
            metadata={documentMetadata}
            items={items}
            calculations={calculations}
            templateId={selectedTemplate}
            customization={templateCustomization}
            notes={notes}
          />
        </div>
      </div>

      <div className="invoice-disclaimer">
        <p>{invoiceSettings.disclaimer.he}</p>
      </div>
    </div>
  )
}
