import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SupabaseShareService from '../services/supabaseShareService'
import WebCryptoEncryption from '../services/webCryptoEncryption'
import QRCode from 'qrcode'
import appSettings from '../config/appSettings.json'
import './TextShare.css'

export default function TextShare({ onBack }) {
  const [searchParams] = useSearchParams()

  // Sender mode states
  const [senderMode, setSenderMode] = useState('create')
  const [senderText, setSenderText] = useState('')
  const [durationHours, setDurationHours] = useState(24)
  const [generatedPin, setGeneratedPin] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  // Receiver mode states
  const [receiverPin, setReceiverPin] = useState('')
  const [retrievedText, setRetrievedText] = useState('')
  const [retrievedMetadata, setRetrievedMetadata] = useState(null)
  const [showDecrypted, setShowDecrypted] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [autoRetrieve, setAutoRetrieve] = useState(false)

  // Auto-populate PIN from URL
  useEffect(() => {
    const pin = searchParams.get('textshare')
    if (pin) {
      setReceiverPin(pin.toUpperCase())
      setSenderMode('receive')
      window.history.replaceState({}, '', '/textshare')
      setTimeout(() => setAutoRetrieve(true), 100)
    }
  }, [searchParams])

  // Auto-retrieve when PIN from URL is set
  useEffect(() => {
    if (autoRetrieve && receiverPin) {
      setAutoRetrieve(false)
      handleRetrieveMessage()
    }
  }, [autoRetrieve, receiverPin])

  // Update character count
  useEffect(() => {
    const bytes = new TextEncoder().encode(senderText).length
    setCharCount(bytes)
  }, [senderText])

  const clearMessage = (type) => {
    if (type === 'error') setError('')
    if (type === 'success') setSuccess('')
  }

  // Handle save
  const handleCreateMessage = async () => {
    clearMessage('error')
    clearMessage('success')

    try {
      if (!senderText.trim()) {
        setError('Please enter some text')
        return
      }

      if (charCount > appSettings.textShare.maxCharacters) {
        setError(`Text exceeds maximum ${appSettings.textShare.maxCharacters} characters`)
        return
      }

      setLoading(true)

      // Generate PIN
      const pin = WebCryptoEncryption.generatePin()

      // Save to Supabase (encrypted client-side)
      await SupabaseShareService.saveShare(senderText, pin, durationHours)

      setGeneratedPin(pin)

      // Generate share message
      const shareUrl = `${window.location.origin}?textshare=${pin}`
      const message = `📤 Secure Text Share\n\nPIN: ${pin}\nLink: ${shareUrl}\n\nExpires in ${durationHours} hour(s)\nMessage will auto-delete after expiration.`
      setShareMessage(message)

      // Generate QR code
      try {
        const dataUrl = await QRCode.toDataURL(shareUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        })
        setQrDataUrl(dataUrl)
      } catch (qrError) {
        console.warn('QR generation failed:', qrError)
      }

      setSuccess('Message created and encrypted successfully!')
      setSenderText('')
    } catch (err) {
      setError(err.message || 'Failed to create message')
    } finally {
      setLoading(false)
    }
  }

  // Handle load
  const handleRetrieveMessage = async () => {
    clearMessage('error')
    clearMessage('success')

    try {
      if (!receiverPin.trim()) {
        setError('Please enter PIN code')
        return
      }

      setLoading(true)
      const { plaintext, metadata } = await SupabaseShareService.loadShare(receiverPin)

      setRetrievedText(plaintext)
      setRetrievedMetadata(metadata)
      setShowDecrypted(true)
      setSuccess('Message decrypted successfully!')
    } catch (err) {
      setRetrievedText('')
      setShowDecrypted(false)
      setError(err.message || 'Failed to retrieve message')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(retrievedText)
      setSuccess('Copied to clipboard!')
      setTimeout(() => clearMessage('success'), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const handleCopyShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setSuccess('Share message copied!')
      setTimeout(() => clearMessage('success'), 2000)
    } catch (err) {
      setError('Failed to copy message')
    }
  }

  const handleDownloadQR = async () => {
    try {
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = `textshare-${generatedPin}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setSuccess('QR code downloaded!')
      setTimeout(() => clearMessage('success'), 2000)
    } catch (err) {
      setError('Failed to download QR code')
    }
  }

  const handleExport = async (format) => {
    try {
      setLoading(true)
      let content = retrievedText
      let filename = `textshare_${new Date().toISOString().split('T')[0]}.${format}`
      let mimeType = 'text/plain'

      if (format === 'txt') {
        mimeType = 'text/plain;charset=utf-8'
      } else if (format === 'rtf') {
        content = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2\n\\margl1440\\margr1440\\margtsxn1440\\margbsxn1440\n${content.replace(/\n/g, '\\par\n')}\n}`
        mimeType = 'application/rtf'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)

      setSuccess(`Exported as ${format.toUpperCase()}!`)
      setTimeout(() => clearMessage('success'), 2000)
    } catch (err) {
      setError(`Export failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResetSender = () => {
    setSenderText('')
    setGeneratedPin('')
    setShareMessage('')
    setQrDataUrl('')
    clearMessage('error')
    clearMessage('success')
  }

  const handleResetReceiver = () => {
    setReceiverPin('')
    setRetrievedText('')
    setRetrievedMetadata(null)
    setShowDecrypted(false)
    clearMessage('error')
    clearMessage('success')
  }

  return (
    <div className="textshare-container">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>📤 Text Share</h2>
      <p>Securely share encrypted text with end-to-end encryption (1-48 hours)</p>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${senderMode === 'create' ? 'active' : ''}`}
          onClick={() => setSenderMode('create')}
        >
          📝 Send Message
        </button>
        <button
          className={`mode-btn ${senderMode === 'receive' ? 'active' : ''}`}
          onClick={() => setSenderMode('receive')}
        >
          📥 Receive Message
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => clearMessage('error')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>✓ {success}</span>
          <button onClick={() => clearMessage('success')}>×</button>
        </div>
      )}

      {/* SENDER MODE */}
      {senderMode === 'create' && (
        <div className="textshare-section">
          <h3>Create & Send Message</h3>

          <div className="control-group">
            <label>Message Text (UTF-8):</label>
            <div className="char-counter">
              {charCount} / {appSettings.textShare.maxCharacters} characters
            </div>
            <textarea
              value={senderText}
              onChange={(e) => setSenderText(e.target.value)}
              placeholder="Enter text to share..."
              rows="8"
              maxLength={appSettings.textShare.maxCharacters}
            />
          </div>

          <div className="options-grid">
            <div className="option-item">
              <label>Expiration Time:</label>
              <select value={durationHours} onChange={(e) => setDurationHours(parseInt(e.target.value))}>
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={handleCreateMessage}
              disabled={loading || !senderText.trim()}
              className="btn btn-primary"
            >
              {loading ? '⏳ Creating...' : '🚀 Send Message'}
            </button>
            <button onClick={handleResetSender} className="btn btn-secondary">
              Clear
            </button>
          </div>

          {generatedPin && (
            <div className="share-info">
              <h4>✅ Message Created & Encrypted!</h4>

              <div className="pin-display">
                <label>PIN Code:</label>
                <div className="pin-box">
                  <code>{generatedPin}</code>
                  <button onClick={() => navigator.clipboard.writeText(generatedPin)}>
                    📋 Copy PIN
                  </button>
                </div>
              </div>

              {qrDataUrl && (
                <div className="qr-display">
                  <label>QR Code:</label>
                  <img src={qrDataUrl} alt="Share QR Code" className="qr-image" />
                  <button onClick={handleDownloadQR} className="btn btn-small">
                    ⬇️ Download QR
                  </button>
                </div>
              )}

              <div className="share-message-section">
                <label>Share Message:</label>
                <textarea value={shareMessage} readOnly rows="6" className="share-message" />
                <button onClick={handleCopyShareMessage} className="btn btn-small">
                  📋 Copy Message
                </button>
              </div>

              <div className="share-options">
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}?textshare=${generatedPin}`)}
                  className="share-btn link"
                >
                  🔗 Copy Link
                </button>
                <a
                  href={`mailto:?subject=TextShare&body=${encodeURIComponent(shareMessage)}`}
                  className="share-btn email"
                >
                  📧 Email
                </a>
                <a
                  href={`sms:?body=${encodeURIComponent(`PIN: ${generatedPin}`)}`}
                  className="share-btn sms"
                >
                  💬 SMS
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECEIVER MODE */}
      {senderMode === 'receive' && (
        <div className="textshare-section">
          <h3>Retrieve Message</h3>

          <div className="control-group">
            <label>PIN Code:</label>
            <input
              type="text"
              value={receiverPin}
              onChange={(e) => setReceiverPin(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit PIN code..."
              maxLength={6}
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button
              onClick={handleRetrieveMessage}
              disabled={loading || !receiverPin.trim()}
              className="btn btn-primary"
            >
              {loading ? '⏳ Decrypting...' : '🔓 Unlock Message'}
            </button>
            <button onClick={handleResetReceiver} className="btn btn-secondary">
              Clear
            </button>
          </div>

          {showDecrypted && retrievedText && (
            <div className="retrieved-message">
              <h4>📖 Message Content</h4>

              {retrievedMetadata && (
                <div className="metadata">
                  <p><strong>Created:</strong> {retrievedMetadata.createdAt.toLocaleString()}</p>
                  <p><strong>Expires:</strong> {retrievedMetadata.expiresAt.toLocaleString()}</p>
                  <p><strong>Access Count:</strong> {retrievedMetadata.accessCount}</p>
                </div>
              )}

              <textarea value={retrievedText} readOnly rows="8" className="message-content" />

              <div className="button-group">
                <button onClick={handleCopy} className="btn btn-small">
                  📋 Copy Text
                </button>
                <button onClick={() => handleExport('txt')} className="btn btn-small">
                  💾 TXT
                </button>
                <button onClick={() => handleExport('rtf')} className="btn btn-small">
                  📄 RTF
                </button>
              </div>

              <button onClick={handleResetReceiver} className="btn btn-secondary">
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
