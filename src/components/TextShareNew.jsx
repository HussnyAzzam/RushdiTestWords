import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import TextShareSupabaseService from '../services/textShareSupabase'
import QRCode from 'qrcode'
import './TextShare-Beautiful.css'
import { TEXTSHARE_MAX_CHARACTERS } from '../settings'

const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' }
]

export default function TextShare({ onBack }) {
  const [searchParams] = useSearchParams()

  // UI states
  const [mode, setMode] = useState('send') // 'send' or 'receive'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Send mode states
  const [messageText, setMessageText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [expirationHours, setExpirationHours] = useState(24)
  const [generatedPin, setGeneratedPin] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [messageHasPassword, setMessageHasPassword] = useState(false)

  // Receive mode states
  const [receiverPin, setReceiverPin] = useState('')
  const [receivedMessage, setReceivedMessage] = useState('')
  const [receiverPassword, setReceiverPassword] = useState('')
  const [messageInfo, setMessageInfo] = useState(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [passwordHash, setPasswordHash] = useState(null)
  const [passwordVerified, setPasswordVerified] = useState(false)

  // Auto-load from URL if pin param exists
  useEffect(() => {
    const pin = searchParams.get('pin')
    if (pin) {
      setReceiverPin(pin)
      setMode('receive')
      // Clean URL but DON'T auto-retrieve - user must click unlock
      window.history.replaceState({}, '', '/textshare')
    }
  }, [searchParams])

  // Update character count
  useEffect(() => {
    const count = new TextEncoder().encode(messageText).length
    setCharCount(count)
  }, [messageText])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  // Send message handler
  const handleSend = async (e) => {
    if (e) e.preventDefault()
    clearMessages()

    try {
      if (!messageText.trim()) {
        setError('Please enter a message')
        return
      }

      const byteCount = new TextEncoder().encode(messageText).length
      if (byteCount > TEXTSHARE_MAX_CHARACTERS) {
        setError(`Message exceeds ${TEXTSHARE_MAX_CHARACTERS} characters`)
        return
      }

      setLoading(true)

      // Use Supabase service to save encrypted message
      // Service generates unique PIN automatically
      const result = await TextShareSupabaseService.saveMessage(
        messageText,
        expirationHours,
        usePassword ? password : null
      )

      setGeneratedPin(result.pin)
      setShareUrl(result.shareUrl)
      setMessageHasPassword(result.requiresPassword)

      // Generate QR code
      try {
        const dataUrl = await QRCode.toDataURL(result.shareUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        })
        setQrDataUrl(dataUrl)
      } catch (qrErr) {
        console.warn('QR generation failed:', qrErr)
      }

      setSuccess('Message created and encrypted successfully!')

      // Clear form
      setMessageText('')
      setPassword('')
      setUsePassword(false)
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  // Receive message handler
  const handleRetrieve = async (pin = receiverPin) => {
    clearMessages()

    try {
      if (!pin.trim()) {
        setError('Please enter a PIN code')
        return
      }

      setLoading(true)

      // Use Supabase service to retrieve and decrypt message
      const result = await TextShareSupabaseService.getMessage(pin)

      // Check if encrypted message indicates password protection
      // For now, we'll assume password protection is needed if a password was set
      // This needs to be stored in metadata in the actual implementation
      setReceivedMessage(result.content)
      setMessageInfo({
        createdAt: result.createdAt,
        expiresAt: result.expiresAt
      })
      
      // Set password requirement and hash from result
      setRequiresPassword(result.requiresPassword)
      setPasswordHash(result.passwordHash)
      setPasswordVerified(!result.requiresPassword) // Mark as verified if no password
      
      setSuccess('Message retrieved!')
    } catch (err) {
      setReceivedMessage('')
      setMessageInfo(null)
      setRequiresPassword(false)
      setReceiverPassword('')
      setError(err.message || 'Failed to retrieve message')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const handleCopy = async (text, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess(`${label} to clipboard!`)
    } catch (err) {
      setError('Failed to copy')
    }
  }

  // Verify password
  const handleVerifyPassword = async () => {
    clearMessages()
    try {
      if (!receiverPassword) {
        setError('Please enter a password')
        return
      }

      const isValid = await TextShareSupabaseService.verifyPassword(receiverPassword, passwordHash)
      if (isValid) {
        setPasswordVerified(true)
        setSuccess('Password verified!')
        setReceiverPassword('')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError(err.message || 'Password verification failed')
    }
  }

  // Export helpers
  const handleExport = async (format) => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `textshare_${timestamp}.${format}`

      if (format === 'txt') {
        const blob = new Blob([receivedMessage], { type: 'text/plain' })
        downloadBlob(blob, filename)
      } else if (format === 'rtf') {
        const rtf = `{\\rtf1\\ansi\\ansicpg1252{\\fonttbl\\f0\\fswiss Helvetica;}\\f0\\fs20 ${receivedMessage.replace(/\n/g, '\\par ')}}`
        const blob = new Blob([rtf], { type: 'application/rtf' })
        downloadBlob(blob, filename)
      }
      setSuccess(`Exported as ${format.toUpperCase()}`)
    } catch (err) {
      setError('Export failed: ' + err.message)
    }
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="textshare-wrapper">
      <button className="back-btn" onClick={() => { window.location.href = '/' }}>← Back</button>
      <div className="textshare-container">
        <h2>📤 Text Share</h2>
        <p>Securely share encrypted messages with PIN codes and QR codes</p>

      {/* Mode Tabs */}
      <div className="mode-tabs">
        <button
          id="send-tab"
          className={`tab ${mode === 'send' ? 'active' : ''}`}
          onClick={() => {
            setMode('send')
            clearMessages()
            setReceivedMessage('')
            setReceiverPin('')
          }}
        >
          📤 Send
        </button>
        <button
          id="receive-tab"
          className={`tab ${mode === 'receive' ? 'active' : ''}`}
          onClick={() => {
            setMode('receive')
            clearMessages()
            setMessageText('')
            setGeneratedPin('')
          }}
        >
          📥 Receive
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-badge">⚠️</span>
          <span className="alert-message">{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          <span className="alert-badge">✓</span>
          <span className="alert-message">{success}</span>
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* SEND MODE */}
      {mode === 'send' && (
        <div className="section send-section">
          <h3>Create & Share Message</h3>

          <form onSubmit={(e) => { e.preventDefault(); handleSend() }}>
            {/* Hidden username field for accessibility */}
            <input type="text" style={{ display: 'none' }} autoComplete="username" readOnly value="textshare" />
            
            <div className="form-group">
              <label htmlFor="message-input">Message:</label>
              <div className="char-counter-container">
                <div className="char-counter">
                  <div className="char-display">
                    <span className="char-current">{charCount}</span>
                    <span className="char-separator">/</span>
                    <span className="char-max">{TEXTSHARE_MAX_CHARACTERS}</span>
                  </div>
                  <div className="char-status">
                    {charCount > TEXTSHARE_MAX_CHARACTERS && (
                      <span className="status-error">❌ Limit exceeded</span>
                    )}
                    {charCount > TEXTSHARE_MAX_CHARACTERS * 0.9 && charCount <= TEXTSHARE_MAX_CHARACTERS && (
                      <span className="status-warning">⚠️ Near limit</span>
                    )}
                    {charCount <= TEXTSHARE_MAX_CHARACTERS * 0.9 && (
                      <span className="status-ok">✓ Good</span>
                    )}
                  </div>
                </div>
                <div className="char-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${charCount > TEXTSHARE_MAX_CHARACTERS ? 'exceeded' : charCount > TEXTSHARE_MAX_CHARACTERS * 0.9 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min((charCount / TEXTSHARE_MAX_CHARACTERS) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <textarea
                id="message-input"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your secret message here..."
                rows="8"
                maxLength={TEXTSHARE_MAX_CHARACTERS}
                disabled={loading}
                className="form-textarea"
              />
            </div>

            {/* Options */}
            <div className="options-grid">
              <div className="form-group">
                <label htmlFor="expiration-select">Expires In:</label>
                <select
                  id="expiration-select"
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(parseInt(e.target.value))}
                  disabled={loading}
                >
                  {EXPIRATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password-check">
                  <input
                    id="password-check"
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => setUsePassword(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Password Protect</span>
                </label>
              </div>
            </div>

            {/* Password Input */}
            {usePassword && (
              <div className="form-group">
                <label htmlFor="password-input">Password (min 4 chars):</label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="button-group">
              <button
                type="submit"
                disabled={loading || !messageText.trim() || charCount > TEXTSHARE_MAX_CHARACTERS}
                className="btn btn-primary"
              >
                {loading ? '⏳ Creating...' : '🚀 Create & Share'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessageText('')
                  setPassword('')
                  setUsePassword(false)
                  setGeneratedPin('')
                  setQrDataUrl('')
                  setShareUrl('')
                  clearMessages()
                }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Share Info */}
          {generatedPin && (
            <div className="share-box">
              <h4>✅ Message Ready to Share</h4>

              {/* PIN */}
              <div className="info-item">
                <label>PIN Code:</label>
                <div className="copy-box">
                  <code>{generatedPin}</code>
                  <button
                    onClick={() => handleCopy(generatedPin)}
                    className="copy-btn"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="info-item">
                  <label>QR Code:</label>
                  <img src={qrDataUrl} alt="QR Code" className="qr-image" />
                  <a href={qrDataUrl} download="textshare-qr.png" className="btn btn-small">
                    ⬇️ Download QR
                  </a>
                </div>
              )}

              {/* Share URL */}
              {shareUrl && (
                <div className="info-item">
                  <label>Direct Link:</label>
                  <div className="copy-box">
                    <input type="text" value={shareUrl} readOnly className="url-input" />
                    <button
                      onClick={() => handleCopy(shareUrl)}
                      className="copy-btn"
                    >
                      📋 Copy
                    </button>
                  </div>

                  {/* Share Options */}
                  <div className="share-options">
                    <a
                      href={`mailto:?subject=Check%20this%20message&body=${encodeURIComponent(shareUrl)}`}
                      className="share-btn email"
                      style={{ color: 'white', textDecoration: 'none' }}
                    >
                      📧 Email
                    </a>
                    <a
                      href={`sms:?body=${encodeURIComponent(shareUrl)}`}
                      className="share-btn sms"
                      style={{ color: 'white', textDecoration: 'none' }}
                    >
                      💬 SMS
                    </a>
                    {navigator.share && (
                      <button
                        onClick={() => navigator.share({
                          title: 'TextShare',
                          text: 'Check out this secure message:',
                          url: shareUrl
                        })}
                        className="share-btn"
                        type="button"
                        style={{ color: 'white' }}
                      >
                        🔗 Share
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RECEIVE MODE */}
      {mode === 'receive' && (
        <div className="section receive-section">
          <h3>Unlock Message</h3>

          <form onSubmit={(e) => { e.preventDefault(); handleRetrieve() }}>
            {/* Hidden username field for accessibility */}
            <input type="text" style={{ display: 'none' }} autoComplete="username" readOnly value="textshare" />
            
            <div className="form-group">
              <label htmlFor="pin-input">PIN Code:</label>
              <input
                id="pin-input"
                type="text"
                value={receiverPin}
                onChange={(e) => setReceiverPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit PIN..."
                maxLength="6"
                inputMode="numeric"
                disabled={loading || !!receivedMessage}
              />
            </div>

            {/* Password Input - Only show if message retrieved AND password protection is enabled */}
            {receivedMessage && requiresPassword && !passwordVerified && (
              <div className="form-group">
                <label htmlFor="receiver-password">Message Password:</label>
                <input
                  id="receiver-password"
                  type="password"
                  value={receiverPassword}
                  onChange={(e) => setReceiverPassword(e.target.value)}
                  placeholder="Enter message password"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="button-group">
              {!receivedMessage ? (
                <button
                  type="submit"
                  disabled={loading || !receiverPin.trim()}
                  className="btn btn-primary"
                >
                  {loading ? '⏳ Unlocking...' : '🔓 Unlock Message'}
                </button>
              ) : requiresPassword && !passwordVerified ? (
                <button
                  type="button"
                  onClick={handleVerifyPassword}
                  disabled={loading || !receiverPassword}
                  className="btn btn-primary"
                >
                  {loading ? '⏳ Verifying...' : '✓ Verify Password'}
                </button>
              ) : null}
              
              <button
                type="button"
                onClick={() => {
                  setReceiverPin('')
                  setReceivedMessage('')
                  setReceiverPassword('')
                  setMessageInfo(null)
                  setRequiresPassword(false)
                  setPasswordHash(null)
                  setPasswordVerified(false)
                  clearMessages()
                }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          </form>            {/* Retrieved Message */}
            {receivedMessage && passwordVerified && (
              <div className="message-box">
                <h4>📖 Message Content</h4>

              {messageInfo && (
                <div className="message-info">
                  <p><strong>Created:</strong> {new Date(messageInfo.createdAt).toLocaleString()}</p>
                  <p><strong>Expires:</strong> {new Date(messageInfo.expiresAt).toLocaleString()}</p>
                </div>
              )}

              <textarea
                value={receivedMessage}
                readOnly
                rows="8"
                className="message-content"
              />

              <div className="button-group">
                <button
                  onClick={() => handleCopy(receivedMessage)}
                  className="btn btn-small"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="btn btn-small"
                >
                  📄 TXT
                </button>
                <button
                  onClick={() => handleExport('rtf')}
                  className="btn btn-small"
                >
                  📋 RTF
                </button>
              </div>              </div>
            )}
        </div>
      )}
      </div>
    </div>
  )
}
