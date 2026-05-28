import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import TextShareEncryption from '../services/textShareEncryption-FIXED'
import TextShareStorage from '../services/textShareStorage-FIXED'
import TextExportService from '../services/textExportService-FIXED'
import QRCodeService from '../services/qrCodeService-FIXED'
import appSettings from '../config/appSettings.json'
import './TextShare.css'

export default function TextShare({ onBack }) {
  const [searchParams] = useSearchParams()
  // Sender mode states
  const [senderMode, setSenderMode] = useState('create') // 'create' or 'view'
  const [senderText, setSenderText] = useState('')
  const [preserveFormat, setPreserveFormat] = useState(false)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [durationHours, setDurationHours] = useState(24)
  const [generatedPin, setGeneratedPin] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCanvas, setQrCanvas] = useState(null)

  // Receiver mode states
  const [receiverPin, setReceiverPin] = useState('')
  const [retrievedText, setRetrievedText] = useState('')
  const [retrievedMetadata, setRetrievedMetadata] = useState(null)
  const [decryptPassword, setDecryptPassword] = useState('')
  const [showDecrypted, setShowDecrypted] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [autoRetrieve, setAutoRetrieve] = useState(false)
  const qrCanvasRef = useRef(null)

  // Auto-populate PIN from URL on load and trigger retrieval
  useEffect(() => {
    const pin = searchParams.get('textshare')
    if (pin) {
      setReceiverPin(pin.toUpperCase())
      setSenderMode('receive')
      // Clean the URL so Back / logo navigate to clean "/textshare"
      window.history.replaceState({}, '', '/textshare')
      // Auto-trigger message retrieval after state is set
      setTimeout(() => {
        setAutoRetrieve(true)
      }, 100)
    }
  }, [searchParams])

  // Auto-trigger retrieval when PIN is set from URL
  useEffect(() => {
    if (autoRetrieve && receiverPin) {
      setAutoRetrieve(false)
      handleRetrieveMessage()
    }
  }, [autoRetrieve, receiverPin])

  // Update character count
  useEffect(() => {
    const text = new TextEncoder().encode(senderText).length;
    setCharCount(text);
  }, [senderText])

  // Clear messages
  const clearMessage = (type) => {
    if (type === 'error') setError('');
    if (type === 'success') setSuccess('');
  };

  // Send/Create message
  const handleCreateMessage = async () => {
    clearMessage('error');
    clearMessage('success');

    try {
      // Validate input
      if (!senderText.trim()) {
        setError('Please enter some text');
        return;
      }

      if (charCount > appSettings.textShare.maxCharacters) {
        setError(`Text exceeds maximum ${appSettings.textShare.maxCharacters} characters`);
        return;
      }

      if (usePassword && !password) {
        setError('Please enter a password');
        return;
      }

      if (usePassword && password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }

      setLoading(true);

      // Encrypt text
      const encryptedData = TextShareEncryption.encryptText(
        senderText,
        usePassword ? password : null
      );

      // Generate PIN if not exists
      let pin = generatedPin;
      if (!pin) {
        do {
          pin = TextShareEncryption.generatePin(appSettings.textShare.pincodeLength);
        } while (TextShareStorage.pincodeExists(pin));
      }

      // Store in database
      const result = TextShareStorage.storeMessage(
        pin,
        encryptedData,
        durationHours,
        {
          originalCharCount: charCount,
          isPasswordProtected: usePassword,
          preserveFormat: preserveFormat
        }
      );

      setGeneratedPin(pin);

      // Generate share message
      const message = QRCodeService.generateShareMessage(pin, true);
      setShareMessage(message);

      // Generate QR code
      try {
        const canvas = await QRCodeService.generateQRCodeCanvas(pin, 300);
        setQrCanvas(canvas);
      } catch (qrError) {
        console.warn('QR generation skipped:', qrError.message);
      }

      setSuccess(result.message);

      // Clear form
      setSenderText('');
      setPassword('');
      setUsePassword(false);
    } catch (err) {
      setError(err.message || 'Failed to create message');
    } finally {
      setLoading(false);
    }
  };

  // Receive/Retrieve message
  const handleRetrieveMessage = async () => {
    clearMessage('error');
    clearMessage('success');

    try {
      if (!receiverPin.trim()) {
        setError('Please enter PIN code');
        return;
      }

      setLoading(true);

      // Get message info
      const message = TextShareStorage.retrieveMessage(receiverPin);

      // Check if password protected
      if (message.metadata.isPasswordProtected && !decryptPassword) {
        setRetrievedMetadata(message.metadata);
        setError('This message is password protected. Please enter password.');
        return;
      }

      // Decrypt text
      const decrypted = TextShareEncryption.decryptText(
        message.encryptedData,
        message.metadata.isPasswordProtected ? decryptPassword : null
      );

      setRetrievedText(decrypted);
      setRetrievedMetadata(message.metadata);
      setShowDecrypted(true);
      setSuccess('Message decrypted successfully!');
    } catch (err) {
      setRetrievedText('');
      setShowDecrypted(false);
      setError(err.message || 'Failed to retrieve message');
    } finally {
      setLoading(false);
    }
  };

  // Export handlers
  const handleExport = async (format) => {
    try {
      clearMessage('error')
      setLoading(true)
      const filename = TextExportService.generateFilename(format)

      if (format === 'txt') {
        TextExportService.exportAsText(retrievedText, filename)
      } else if (format === 'rtf') {
        TextExportService.exportAsRTF(retrievedText, filename)
      } else if (format === 'docx') {
        await TextExportService.exportAsDOCX(retrievedText, filename)
      }

      setSuccess(`Exported as ${format.toUpperCase()}`)
    } catch (err) {
      setError(err.message || 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      clearMessage('error');
      const result = await TextExportService.copyToClipboard(retrievedText);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to copy');
    }
  };

  // Copy share message
  const handleCopyShareMessage = async () => {
    try {
      const result = await TextExportService.copyToClipboard(shareMessage);
      if (result.success) {
        setSuccess('Share message copied!');
      }
    } catch (err) {
      setError('Failed to copy');
    }
  };

  // Download QR code
  const handleDownloadQR = () => {
    try {
      QRCodeService.downloadQRCode(generatedPin, `textshare_${generatedPin}.png`);
      setSuccess('QR code downloaded!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset sender
  const handleResetSender = () => {
    setSenderText('');
    setGeneratedPin('');
    setShareMessage('');
    setQrCanvas(null);
    setPassword('');
    setUsePassword(false);
    setPreserveFormat(false);
    clearMessage('error');
    clearMessage('success');
  };

  // Reset receiver
  const handleResetReceiver = () => {
    setReceiverPin('');
    setRetrievedText('');
    setRetrievedMetadata(null);
    setDecryptPassword('');
    setShowDecrypted(false);
    clearMessage('error');
    clearMessage('success');
  };

  return (
    <div className="textshare-container">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>📤 Text Share Tool</h2>
      <p>Securely share encrypted text with others via PIN code or QR code (up to 48 hours)</p>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${senderMode === 'create' ? 'active' : ''}`}
          onClick={() => { setSenderMode('create'); handleResetSender(); }}
        >
          📝 Send Message
        </button>
        <button
          className={`mode-btn ${senderMode === 'receive' ? 'active' : ''}`}
          onClick={() => { setSenderMode('receive'); handleResetReceiver(); }}
        >
          📥 Receive Message
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-badge">⚠️ Error</span>
          <span>{error}</span>
          <button onClick={() => clearMessage('error')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span className="alert-badge">✓ Success</span>
          <span>{success}</span>
          <button onClick={() => clearMessage('success')}>×</button>
        </div>
      )}

      {/* SENDER MODE */}
      {senderMode === 'create' && (
        <div className="textshare-section">
          <h3>Create & Send Message</h3>

          {/* Text Input */}
          <div className="control-group">
            <label>Message Text (UTF-8 Standard):</label>
            <div className="char-counter">
              {charCount} / {appSettings.textShare.maxCharacters} characters
              <span className={charCount > appSettings.textShare.maxCharacters ? 'exceeded' : ''}>
                {charCount > appSettings.textShare.maxCharacters * 0.9 ? '⚠️' : ''}
              </span>
            </div>
            <textarea
              value={senderText}
              onChange={(e) => setSenderText(e.target.value)}
              placeholder="Enter text to share..."
              rows="8"
              maxLength={appSettings.textShare.maxCharacters}
            />
          </div>

          {/* Options */}
          <div className="options-grid">
            <div className="option-item">
              <label>
                <input
                  type="checkbox"
                  checked={preserveFormat}
                  onChange={(e) => setPreserveFormat(e.target.checked)}
                />
                Preserve Formatting
              </label>
              <small>Keep line breaks and spacing</small>
            </div>

            <div className="option-item">
              <label>
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                />
                Password Protect
              </label>
              <small>Recipient must enter password</small>
            </div>

            {usePassword && (
              <div className="option-item">
                <label>Password (min 4 chars):</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            )}

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

          {/* Send Button */}
          <div className="button-group">
            <button
              onClick={handleCreateMessage}
              disabled={loading || !senderText.trim()}
              className="btn btn-primary"
            >
              {loading ? '⏳ Creating...' : '🚀 Send Message'}
            </button>
            <button
              onClick={handleResetSender}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>

          {/* Generated Share Info */}
          {generatedPin && (
            <div className="share-info">
              <h4>✅ Message Created Successfully!</h4>

              <div className="pin-display">
                <label>PIN Code:</label>
                <div className="pin-box">
                  <code>{generatedPin}</code>
                  <button onClick={() => TextExportService.copyToClipboard(generatedPin)}>
                    📋 Copy PIN
                  </button>
                </div>
              </div>

              {qrCanvas && (
                <div className="qr-display">
                  <label>QR Code:</label>
                  <div
                    className="qr-canvas-container"
                    ref={el => { if (el && qrCanvas) { el.innerHTML = ''; el.appendChild(qrCanvas) } }}
                  />
                  <button onClick={handleDownloadQR} className="btn btn-small">
                    ⬇️ Download QR
                  </button>
                </div>
              )}

              <div className="share-message-section">
                <label>Share Message:</label>
                <textarea
                  value={shareMessage}
                  readOnly
                  rows="6"
                  className="share-message"
                />
                <button onClick={handleCopyShareMessage} className="btn btn-small">
                  📋 Copy Message
                </button>
              </div>

              <div className="share-options">
                <button
                  onClick={async () => {
                    const link = QRCodeService.copyDirectLink(generatedPin)
                    const result = await TextExportService.copyToClipboard(link)
                    if (result.success) {
                      setSuccess('Direct link copied to clipboard!')
                    }
                  }}
                  className="share-btn link"
                >
                  🔗 Copy Link
                </button>
                <a href={QRCodeService.generateEmailLink(generatedPin)} className="share-btn email">
                  📧 Email
                </a>
                <a href={QRCodeService.generateSMSLink(generatedPin)} className="share-btn sms">
                  💬 SMS
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      QRCodeService.shareViaWebAPI(generatedPin)
                        .catch(() => setError('Share failed'));
                    } else {
                      setError('Share API not supported');
                    }
                  }}
                  className="share-btn web"
                >
                  🔗 Share
                </button>
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
              maxLength={10}
              disabled={loading}
            />
          </div>

          {/* Password Input (conditional) */}
          {retrievedMetadata && retrievedMetadata.isPasswordProtected && !showDecrypted && (
            <div className="control-group">
              <label>Password:</label>
              <input
                type="password"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                placeholder="Enter message password..."
              />
            </div>
          )}

          <div className="button-group">
            <button
              onClick={handleRetrieveMessage}
              disabled={loading || !receiverPin.trim()}
              className="btn btn-primary"
            >
              {loading ? '⏳ Retrieving...' : '🔓 Unlock Message'}
            </button>
            <button
              onClick={handleResetReceiver}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>

          {/* Retrieved Message Display */}
          {showDecrypted && retrievedText && (
            <div className="retrieved-message">
              <h4>📖 Message Content</h4>

              <div className="metadata">
                <p><strong>Created:</strong> {new Date(retrievedMetadata.created).toLocaleString()}</p>
                <p><strong>Expires:</strong> {new Date(retrievedMetadata.expiresAt).toLocaleString()}</p>
                <p><strong>Character Count:</strong> {retrievedMetadata.originalCharCount}</p>
                <p><strong>Access Count:</strong> {retrievedMetadata.accessCount}</p>
              </div>

              <textarea
                value={retrievedText}
                readOnly
                rows="8"
                className="message-content"
              />

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
                <button onClick={() => handleExport('docx')} className="btn btn-small">
                  📘 DOCX
                </button>
              </div>

              <button
                onClick={handleResetReceiver}
                className="btn btn-secondary"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}

      {/* Storage Stats */}
      <div className="storage-info" style={{ display: 'none' }}>
        <details>
          <summary>Storage Information</summary>
          {(() => {
            const stats = TextShareStorage.getStatistics();
            return (
              <div className="stats">
                <p><strong>Stored Messages:</strong> {stats.totalMessages} / {stats.maxMessages}</p>
                <p><strong>Storage Usage:</strong> {stats.storageUsage}</p>
                <p><strong>Last Cleanup:</strong> {stats.lastCleanup}</p>
              </div>
            );
          })()}
        </details>
      </div>
    </div>
  );
}
