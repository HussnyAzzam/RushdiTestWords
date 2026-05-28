import React, { useState, useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './QRCodeGenerator.css'

export default function QRCodeGenerator({ onBack }) {
  // Input states
  const [qrType, setQrType] = useState('url')
  const [qrValue, setQrValue] = useState('https://example.com')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiSecurity, setWifiSecurity] = useState('WPA')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [locationLat, setLocationLat] = useState('40.7128')
  const [locationLng, setLocationLng] = useState('-74.0060')
  const [locationLabel, setLocationLabel] = useState('New York')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')

  // Customization states
  const [qrSize, setQrSize] = useState(300)
  const [errorCorrection, setErrorCorrection] = useState('H')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [logoUrl, setLogoUrl] = useState('')
  const [borderSize, setBorderSize] = useState(0)

  // QR Size presets
  const qrSizePresets = [
    { label: '50px × 50px (Tiny)', value: 50 },
    { label: '100px × 100px (Small)', value: 100 },
    { label: '200px × 200px (Medium)', value: 200 },
    { label: '300px × 300px (Large)', value: 300 },
    { label: '500px × 500px (X-Large)', value: 500 },
    { label: '1000px × 1000px (2K)', value: 1000 },
    { label: '2000px × 2000px (4K)', value: 2000 },
  ]

  // UI states
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrHistory, setQrHistory] = useState([])
  const [showPdfOptions, setShowPdfOptions] = useState(false)
  const [pdfTitle, setPdfTitle] = useState('QR Code')
  const [pdfDescription, setPdfDescription] = useState('')
  const qrCanvasRef = useRef(null)

  // Load history on mount
  useEffect(() => {
    loadQRHistory()
  }, [])

  // Generate QR whenever inputs change
  useEffect(() => {
    generateQR()
  }, [qrValue, qrType, phoneNumber, emailAddress, emailSubject, emailBody, wifiSSID, wifiPassword, wifiSecurity, contactName, contactPhone, contactEmail, locationLat, locationLng, whatsappNumber, whatsappMessage, qrSize, errorCorrection, fgColor, bgColor])

  // Build the QR value based on type
  const buildQRValue = () => {
    switch (qrType) {
      case 'url':
        return qrValue
      case 'text':
        return qrValue
      case 'email':
        const emailTo = emailAddress
        const subject = emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ''
        const body = emailBody ? `${subject ? '&' : '?'}body=${encodeURIComponent(emailBody)}` : ''
        return `mailto:${emailTo}${subject}${body}`
      case 'phone':
        return `tel:${phoneNumber}`
      case 'whatsapp':
        const waMessage = whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''
        return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}${waMessage}`
      case 'wifi':
        return `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};;`
      case 'location':
        return `https://maps.google.com/?q=${locationLat},${locationLng}`
      case 'vcard':
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
TEL:${contactPhone}
EMAIL:${contactEmail}
END:VCARD`
        return vcard
      default:
        return qrValue
    }
  }

  const generateQR = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate input
      const value = buildQRValue()
      if (!value || value.length === 0) {
        setError('Please enter a value for the QR code')
        setLoading(false)
        return
      }

      // Generate QR code as data URL
      const dataUrl = await QRCodeLib.toDataURL(value, {
        errorCorrectionLevel: errorCorrection,
        type: 'image/png',
        quality: 0.95,
        margin: borderSize,
        width: qrSize,
        color: {
          dark: fgColor,
          light: bgColor
        }
      })

      setQrDataUrl(dataUrl)
      setError('')
    } catch (err) {
      setError('Failed to generate QR code: ' + err.message)
      setQrDataUrl(null)
    } finally {
      setLoading(false)
    }
  }

  const loadQRHistory = () => {
    try {
      const history = localStorage.getItem('qrcode_history')
      if (history) {
        setQrHistory(JSON.parse(history))
      }
    } catch (err) {
      console.error('Failed to load QR history:', err)
    }
  }

  const saveToHistory = () => {
    try {
      const value = buildQRValue()
      const newEntry = {
        id: Date.now(),
        type: qrType,
        value: value.substring(0, 100),
        dataUrl: qrDataUrl,
        created: new Date().toLocaleString()
      }

      const updated = [newEntry, ...qrHistory.slice(0, 19)] // Keep last 20
      setQrHistory(updated)
      localStorage.setItem('qrcode_history', JSON.stringify(updated))
      setSuccess('QR code saved to history!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to save to history')
    }
  }

  const downloadQR = async (format = 'png') => {
    try {
      if (!qrDataUrl) {
        setError('No QR code to download')
        return
      }

      // Show PDF options dialog if format is PDF
      if (format === 'pdf') {
        setShowPdfOptions(true)
        return
      }

      const timestamp = new Date().toISOString().slice(0, 10)
      let filename = `qrcode_${timestamp}`
      let link = document.createElement('a')

      if (format === 'png') {
        link.href = qrDataUrl
        link.download = `${filename}.png`
        link.click()
      } else if (format === 'svg') {
        // Generate SVG version
        try {
          const value = buildQRValue()
          const svgString = await QRCodeLib.toString(value, {
            type: 'image/svg+xml',
            errorCorrectionLevel: errorCorrection,
            width: qrSize,
            margin: borderSize,
            color: {
              dark: fgColor,
              light: bgColor
            }
          })
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          link.href = url
          link.download = `${filename}.svg`
          link.click()
          URL.revokeObjectURL(url)
        } catch (err) {
          setError('SVG generation not available, please try PNG instead')
          return
        }
      }

      setSuccess(`Downloaded as ${format.toUpperCase()}!`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const generatePDF = async () => {
    try {
      if (!qrDataUrl) {
        setError('No QR code to download')
        setShowPdfOptions(false)
        return
      }

      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `qrcode_${timestamp}`

      // Create a temporary container for rendering content
      const container = document.createElement('div')
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        background: white;
        padding: 20mm;
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #333;
      `

      // Create content structure
      const content = document.createElement('div')
      content.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 20px;
      `

      // Add title
      if (pdfTitle) {
        const titleEl = document.createElement('h1')
        titleEl.style.cssText = `
          font-size: 48px;
          font-weight: bold;
          margin: 0;
          padding: 0;
          color: #333;
          word-wrap: break-word;
          width: 100%;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        `
        titleEl.textContent = pdfTitle
        content.appendChild(titleEl)
      }

      // Add description - preserve formatting
      if (pdfDescription) {
        const descEl = document.createElement('p')
        descEl.style.cssText = `
          font-size: 20px;
          margin: 0;
          padding: 0;
          color: #000000;
          word-wrap: break-word;
          width: 100%;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          text-align: center;
        `
        descEl.textContent = pdfDescription
        content.appendChild(descEl)
      }

      // Add QR code image
      const qrImg = document.createElement('img')
      qrImg.src = qrDataUrl
      qrImg.style.cssText = `
        max-width: 300px;
        margin-top: 40px;
      `
      content.appendChild(qrImg)

      container.appendChild(content)
      document.body.appendChild(container)

      // Convert to canvas with better settings for text preservation
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        imageTimeout: 0
      })

      // Create PDF from canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)

      // Save PDF
      pdf.save(`${filename}.pdf`)
      setSuccess('Downloaded as PDF!')
      setShowPdfOptions(false)

      // Cleanup
      document.body.removeChild(container)
    } catch (err) {
      setError(`PDF generation failed: ${err.message}`)
      setShowPdfOptions(false)
    }
  }

  // Helper function to escape HTML special characters
  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  const copyQRToClipboard = async () => {
    try {
      if (!qrDataUrl) {
        setError('No QR code to copy')
        return
      }

      const canvas = document.createElement('canvas')
      const img = new Image()
      img.src = qrDataUrl
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            setSuccess('QR code copied to clipboard!')
            setTimeout(() => setSuccess(''), 2000)
          }).catch(err => {
            setError('Failed to copy: ' + err.message)
          })
        })
      }
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const shareQR = async () => {
    try {
      if (!qrDataUrl) {
        setError('No QR code to share')
        return
      }

      if (navigator.share) {
        const canvas = document.createElement('canvas')
        const img = new Image()
        img.src = qrDataUrl
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            navigator.share({
              files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
              title: 'QR Code',
              text: 'Check out this QR code!'
            }).catch(err => console.log('Share cancelled:', err))
          })
        }
      } else {
        setError('Web Share API not supported on this browser')
      }
    } catch (err) {
      setError('Failed to share: ' + err.message)
    }
  }

  const renderInputForm = () => {
    return (
      <div className="qr-form">
        <div className="form-group">
          <label>QR Code Type</label>
          <select value={qrType} onChange={(e) => setQrType(e.target.value)} className="form-control">
            <option value="url">Website URL</option>
            <option value="text">Plain Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
            <option value="whatsapp">WhatsApp Message</option>
            <option value="wifi">Wi-Fi Network</option>
            <option value="location">Location (Map)</option>
            <option value="vcard">Contact (vCard)</option>
          </select>
        </div>

        {/* URL Input */}
        {qrType === 'url' && (
          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="form-control"
            />
          </div>
        )}

        {/* Text Input */}
        {qrType === 'text' && (
          <div className="form-group">
            <label>Plain Text</label>
            <textarea
              placeholder="Enter any text..."
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="form-control"
              rows="3"
            />
          </div>
        )}

        {/* Email Input */}
        {qrType === 'email' && (
          <>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="recipient@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Subject (Optional)</label>
              <input
                type="text"
                placeholder="Email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                placeholder="Email body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="form-control"
                rows="2"
              />
            </div>
          </>
        )}

        {/* Phone Input */}
        {qrType === 'phone' && (
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-control"
            />
          </div>
        )}

        {/* WhatsApp Input */}
        {qrType === 'whatsapp' && (
          <>
            <div className="form-group">
              <label>WhatsApp Number (with country code)</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Pre-filled Message (Optional)</label>
              <textarea
                placeholder="Message to send"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="form-control"
                rows="2"
              />
            </div>
          </>
        )}

        {/* WiFi Input */}
        {qrType === 'wifi' && (
          <>
            <div className="form-group">
              <label>Network Name (SSID)</label>
              <input
                type="text"
                placeholder="WiFi network name"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="WiFi password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Security Type</label>
              <select value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)} className="form-control">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Password)</option>
              </select>
            </div>
          </>
        )}

        {/* Location Input */}
        {qrType === 'location' && (
          <>
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                placeholder="40.7128"
                step="0.0001"
                value={locationLat}
                onChange={(e) => setLocationLat(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                placeholder="-74.0060"
                step="0.0001"
                value={locationLng}
                onChange={(e) => setLocationLng(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Location Label (Optional)</label>
              <input
                type="text"
                placeholder="Location name"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="form-control"
              />
            </div>
          </>
        )}

        {/* vCard Input */}
        {qrType === 'vcard' && (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="form-control"
              />
            </div>
          </>
        )}

        {/* Customization Section */}
        <div className="customization-section">
          <h3>🎨 Customization</h3>
          
          <div className="form-group">
            <label>QR Code Size</label>
            <select 
              value={qrSize} 
              onChange={(e) => setQrSize(parseInt(e.target.value))} 
              className="form-control"
            >
              {qrSizePresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group color-group">
            <label>Foreground Color</label>
            <div className="color-input">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="form-control"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="form-group color-group">
            <label>Background Color</label>
            <div className="color-input">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="form-control"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Border Size</label>
            <input
              type="range"
              min="0"
              max="4"
              value={borderSize}
              onChange={(e) => setBorderSize(parseInt(e.target.value))}
              className="form-slider"
            />
            <span className="size-display">{borderSize}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qrcode-generator">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div className="generator-header">
        <h1>📲 QR Code Generator</h1>
        <p>Create scannable QR codes for any content type</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="generator-container">
        {/* Left: Input Form */}
        <div className="generator-left">
          {renderInputForm()}
        </div>

        {/* Right: Preview and Download */}
        <div className="generator-right">
          {/* QR Preview */}
          <div className="qr-preview-container">
            <h2>📱 QR Code Preview</h2>
            {loading ? (
              <div className="qr-loading">Generating...</div>
            ) : qrDataUrl ? (
              <>
                <div className="qr-display">
                  <img src={qrDataUrl} alt="QR Code" className="qr-image" ref={qrCanvasRef} />
                </div>
                <p className="qr-info">Ready to download or share</p>
              </>
            ) : (
              <div className="qr-empty">
                <p>QR code preview will appear here</p>
              </div>
            )}
          </div>

          {/* Download and Share Buttons */}
          {qrDataUrl && (
            <div className="action-buttons">
              <button onClick={() => downloadQR('png')} className="btn btn-primary">
                ⬇️ PNG
              </button>
              <button onClick={() => downloadQR('svg')} className="btn btn-primary">
                ⬇️ SVG
              </button>
              <button onClick={() => downloadQR('pdf')} className="btn btn-primary">
                ⬇️ PDF
              </button>
              <button onClick={copyQRToClipboard} className="btn btn-secondary">
                📋 Copy
              </button>
              <button onClick={shareQR} className="btn btn-secondary">
                🔗 Share
              </button>
              <button onClick={saveToHistory} className="btn btn-secondary">
                💾 Save
              </button>
            </div>
          )}

          {/* QR History */}
          {qrHistory.length > 0 && (
            <div className="qr-history">
              <h3>📜 Recent QR Codes</h3>
              <div className="history-grid">
                {qrHistory.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="history-item"
                    onClick={() => {
                      setQrDataUrl(entry.dataUrl)
                    }}
                    title={`${entry.type}: ${entry.value}`}
                  >
                    <img src={entry.dataUrl} alt="Saved QR" />
                    <span className="history-type">{entry.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Configuration Modal */}
      {showPdfOptions && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal">
            <div className="pdf-modal-header">
              <h2>📄 PDF Configuration</h2>
              <button className="pdf-modal-close" onClick={() => setShowPdfOptions(false)}>×</button>
            </div>

            <div className="pdf-modal-content">
              <div className="pdf-form-group">
                <label>PDF Title</label>
                <input
                  type="text"
                  placeholder="Enter PDF title"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="pdf-form-control"
                />
              </div>

              <div className="pdf-form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Enter a description about this QR code..."
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  className="pdf-form-control"
                  rows="4"
                />
              </div>

              <div className="pdf-preview">
                <h3>Preview</h3>
                <div className="pdf-preview-content">
                  {pdfTitle && <p className="preview-title">{pdfTitle}</p>}
                  {pdfDescription && <p className="preview-description">{pdfDescription}</p>}
                  <p className="preview-qr">📱 QR Code will appear here</p>
                </div>
              </div>
            </div>

            <div className="pdf-modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPdfOptions(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={generatePDF}
              >
                ⬇️ Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
