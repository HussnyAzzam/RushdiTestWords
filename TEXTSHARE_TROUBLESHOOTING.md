# TextShare - Troubleshooting & Troubleshooting Guide

## 🔧 Installation Troubleshooting

### Issue 1: npm install fails with version conflicts

**Error Message**:
```
npm ERR! peer tweetnacl-util@^0.15.1 requires tweetnacl@^1.0.0 but none is installed
```

**Solutions**:
```bash
# Option 1: Install all at once
npm install tweetnacl tweetnacl-util docx qrcode

# Option 2: Use --legacy-peer-deps flag
npm install --legacy-peer-deps tweetnacl tweetnacl-util docx qrcode

# Option 3: Install individually with specific versions
npm install tweetnacl@1.0.3
npm install tweetnacl-util@0.15.1
npm install docx@8.10.0
npm install qrcode@1.5.3
```

---

### Issue 2: QRCode not defined in browser

**Error Message**:
```
Uncaught ReferenceError: QRCode is not defined
```

**Solutions**:
1. **Add to public/index.html**:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

2. **Or install via npm**:
```bash
npm install qrcode
```

Then import in component:
```javascript
import QRCode from 'qrcode'
```

3. **Verify script loads**:
```javascript
// In browser console
console.log(window.QRCode) // Should show QRCode object
```

---

### Issue 3: docx library import errors

**Error Message**:
```
Cannot find module 'docx' or its corresponding type declarations
```

**Solutions**:
```bash
# Reinstall docx
npm install docx@8.10.0

# Clear cache
npm cache clean --force
npm install

# Check if installed
npm list docx

# Update TextShare component import
import { Document, Packer, Paragraph, TextRun } from 'docx'
```

---

## 🧪 Component Troubleshooting

### Issue 4: TextShare component doesn't appear

**Checklist**:
- [ ] Component imported correctly: `import TextShare from './components/TextShare'`
- [ ] TextShare.jsx exists in correct path
- [ ] TextShare.css exists in same directory
- [ ] onBack prop passed correctly
- [ ] Navigation onClick handler calls setCurrentTool
- [ ] No console errors on page load

**Debug Code**:
```javascript
// Add to Home.jsx to verify
console.log('TextShare imported:', TextShare)
console.log('Current tool:', currentTool)
console.log('Should show TextShare:', currentTool === 'textshare')
```

---

### Issue 5: Styles not applying (TextShare.css)

**Checklist**:
- [ ] CSS file in: `src/components/TextShare.css`
- [ ] CSS imports in TextShare.jsx
- [ ] No CSS file path errors in console
- [ ] Browser DevTools shows CSS rules applied
- [ ] No conflicting global CSS

**Solutions**:
```jsx
// In TextShare.jsx, add explicit import
import './TextShare.css'

// Or use CSS module
import styles from './TextShare.css'
```

**Verify CSS loads**:
```javascript
// In browser console
const links = document.querySelectorAll('link[href*="TextShare"]')
console.log('CSS links found:', links.length)
```

---

### Issue 6: Modal/alerts not showing

**Problem**: Error/success messages don't display

**Solutions**:
```javascript
// Check if alert state is updating
const [error, setError] = useState('')

// Verify in JSX
{error && (
  <div className="alert alert-error">
    {error}
    <button onClick={() => setError('')}>×</button>
  </div>
)}

// Debug clearMessage function
const clearMessage = (type) => {
  console.log('Clearing:', type)
  if (type === 'error') setError('')
  if (type === 'success') setSuccess('')
}
```

---

## 🔐 Encryption & Security Troubleshooting

### Issue 7: Encryption fails with "not a function" error

**Error Message**:
```
TextShareEncryption.encryptText is not a function
```

**Solutions**:
```javascript
// Check import
import TextShareEncryption from '../services/textShareEncryption'

// Verify export in service
module.exports = TextShareEncryption

// Or use ES6 export
export default TextShareEncryption

// Test in console
console.log(typeof TextShareEncryption.encryptText) // Should be 'function'
```

---

### Issue 8: Decryption returns garbled text

**Problem**: Decrypted text is unreadable

**Causes**:
- Wrong password used
- Data corrupted
- Encoding issue

**Solutions**:
```javascript
// Verify UTF-8 encoding/decoding
const testText = 'Hello 世界 🌍'
const encrypted = TextShareEncryption.encryptText(testText)
const decrypted = TextShareEncryption.decryptText(encrypted)
console.log('Match:', testText === decrypted) // Should be true

// Check encoding
const bytes = new TextEncoder().encode(testText)
console.log('UTF-8 bytes:', bytes)

// Test password encryption
const pwd = 'test123'
const enc = TextShareEncryption.encryptText(testText, pwd)
const dec = TextShareEncryption.decryptText(enc, pwd)
console.log('Password protected match:', testText === dec) // Should be true
```

---

### Issue 9: QR code won't generate

**Error Message**:
```
Failed to generate QR code
```

**Solutions**:
```javascript
// Verify QRCode is loaded
if (typeof QRCode === 'undefined') {
  console.error('QRCode library not loaded')
  // Add script to HTML
}

// Test QR generation
const qr = new QRCode({
  text: '123456',
  width: 256,
  height: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  correctLevel: QRCode.CorrectLevel.H
})

console.log('QR generated:', qr._canvas)
```

---

## 💾 Storage & Data Troubleshooting

### Issue 10: Messages not saving

**Problem**: After creating message, PIN shows but message not retrievable

**Checklist**:
- [ ] localStorage is enabled in browser
- [ ] Storage quota not exceeded
- [ ] AppSettings.json loaded correctly
- [ ] No JavaScript errors on store

**Debug**:
```javascript
// Check localStorage
console.log('Storage available:', typeof(Storage))
console.log('localStorage size:', JSON.stringify(localStorage).length)

// Check if message stored
const db = JSON.parse(localStorage.getItem('textshare_messages'))
console.log('Messages stored:', db.messages.length)

// Try manual store
TextShareStorage.storeMessage('TEST123', {
  ciphertext: 'base64...',
  nonce: 'base64...',
  key: 'base64...',
  isPasswordProtected: false,
  algorithm: 'XSalsa20-Poly1305',
  encoding: 'UTF-8'
}, 24)
```

---

### Issue 11: Expired messages not deleting

**Problem**: Old messages still retrievable after expiration

**Solutions**:
```javascript
// Manual cleanup
const deleted = TextShareStorage.cleanupExpired()
console.log('Deleted messages:', deleted)

// Force cleanup on load
if (typeof window !== 'undefined') {
  TextShareStorage.cleanupExpired()
}

// Verify expiration date
const msg = TextShareStorage.retrieveMessage('PINCODE')
console.log('Expires:', msg.metadata.expiresAt)
console.log('Now:', new Date().toISOString())
console.log('Is expired:', new Date(msg.metadata.expiresAt) < new Date())
```

---

### Issue 12: Storage quota exceeded

**Error Message**:
```
QuotaExceededError: DOM Exception 22
```

**Solutions**:
```javascript
// Check storage usage
const stats = TextShareStorage.getStatistics()
console.log('Storage usage:', stats.storageUsage)

// Clear old messages manually
const allMessages = TextShareStorage.getAllMessages()
console.log('Total messages:', allMessages.length)

// Delete specific message
TextShareStorage.deleteMessage('PINCODE')

// Reduce max storage in appSettings
const newMaxMessages = 500 // From 1000

// Clear all (last resort)
localStorage.removeItem('textshare_messages')
```

---

## 📤 Export Troubleshooting

### Issue 13: DOCX export fails

**Error Message**:
```
Failed to export as DOCX: Cannot read property 'toBlob'
```

**Solutions**:
```bash
# Verify docx installed
npm list docx

# Reinstall
npm install docx@8.10.0

# Check import
import { Document, Packer, Paragraph, TextRun } from 'docx'
```

```javascript
// Test DOCX export
const content = 'Test message'
TextExportService.exportAsDOCX(content).then(() => {
  console.log('DOCX exported successfully')
}).catch(err => {
  console.error('DOCX export error:', err)
})
```

---

### Issue 14: TXT export creates empty file

**Problem**: Downloaded TXT file is blank

**Solutions**:
```javascript
// Verify content passed
console.log('Content to export:', content)
console.log('Content length:', content.length)

// Check Blob creation
const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
console.log('Blob size:', blob.size)
console.log('Blob type:', blob.type)

// Test download
const url = URL.createObjectURL(blob)
console.log('Blob URL:', url)

// Verify file download
const link = document.createElement('a')
link.href = url
link.download = 'test.txt'
link.click() // Should trigger download
```

---

### Issue 15: Copy to clipboard fails on mobile

**Error Message**:
```
Failed to copy to clipboard
```

**Solutions**:
```javascript
// Use fallback method
const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

// Test both methods
navigator.clipboard?.writeText(content)
  .catch(() => fallbackCopy(content))

// Verify Clipboard API available
console.log('Clipboard API:', !!navigator.clipboard)
```

---

## 🎯 Performance Issues

### Issue 16: Encryption/decryption slow

**Symptoms**: Operations take >500ms

**Solutions**:
```javascript
// Check device CPU speed
console.time('encrypt')
TextShareEncryption.encryptText('Test message')
console.timeEnd('encrypt')

// Optimize for mobile (use service worker if heavy)
// Or batch operations

// Use Web Workers for heavy lifting
const worker = new Worker('encrypt-worker.js')
worker.postMessage({ text: largeText })
worker.onmessage = (e) => {
  console.log('Encrypted:', e.data)
}
```

---

### Issue 17: QR generation lags

**Solutions**:
```javascript
// Defer QR generation
setTimeout(() => {
  QRCodeService.generateQRCodeCanvas(pin)
}, 100)

// Or use CDN QRCode instead of npm
// Smaller, faster for browser

// Show loading state
setLoading(true)
// ... generate QR ...
setLoading(false)
```

---

## 🌐 Browser Compatibility Issues

### Issue 18: TextShare fails in Safari

**Problem**: Component breaks on Safari

**Checklist**:
- [ ] Using ES6 syntax (need polyfills)
- [ ] localStorage supported
- [ ] Clipboard API fallback working
- [ ] Canvas API for QR

**Solutions**:
```bash
# Add polyfills
npm install core-js

# In index.js
import 'core-js/stable'
```

---

### Issue 19: localStorage not working

**Error Message**:
```
Uncaught SecurityError: localStorage is disabled
```

**Causes**:
- Private/Incognito mode
- Cross-origin restrictions
- Browser security settings

**Solutions**:
```javascript
// Detect availability
const storageAvailable = () => {
  try {
    const test = '__localStorage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// Fallback to memory storage
if (!storageAvailable()) {
  const memoryDB = {}
  // Use memoryDB instead
}
```

---

## 🐛 General Debugging

### Enable Debug Mode

Add to services:
```javascript
const DEBUG = true

const log = (label, data) => {
  if (DEBUG) console.log(`[TextShare] ${label}:`, data)
}

// Use throughout code
log('PIN Generated', pin)
log('Message Encrypted', encryptedData)
log('Storage Updated', result)
```

### Browser DevTools

```javascript
// Check all messages
TextShareStorage.getAllMessages()

// Get statistics
TextShareStorage.getStatistics()

// Test encryption
TextShareEncryption.encryptText('test')

// Manually delete message
TextShareStorage.deleteMessage('PINCODE')

// Cleanup expired
TextShareStorage.cleanupExpired()
```

### Console Commands

```javascript
// Verify all services loaded
console.log({
  encryption: typeof TextShareEncryption,
  storage: typeof TextShareStorage,
  export: typeof TextExportService,
  qr: typeof QRCodeService
})

// Check configuration
console.log(appSettings.textShare)

// Monitor localStorage changes
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key)
})
```

---

## 📋 Diagnostic Checklist

Run this to diagnose issues:

```javascript
console.group('TextShare Diagnostics')

// 1. Services loaded
console.log('Services:')
console.log('- Encryption:', typeof TextShareEncryption)
console.log('- Storage:', typeof TextShareStorage)
console.log('- Export:', typeof TextExportService)
console.log('- QR:', typeof QRCodeService)

// 2. Environment
console.log('Environment:')
console.log('- localStorage available:', typeof(Storage))
console.log('- QRCode library:', typeof QRCode)
console.log('- React version:', React.version)

// 3. Configuration
console.log('Settings:')
console.log('- Max chars:', appSettings.textShare.maxCharacters)
console.log('- Max duration:', appSettings.textShare.maxDurationHours)
console.log('- Max stored:', appSettings.textShare.maxStoredMessages)

// 4. Storage status
console.log('Storage:')
const stats = TextShareStorage.getStatistics()
console.log('- Total messages:', stats.totalMessages)
console.log('- Storage usage:', stats.storageUsage)

console.groupEnd()
```

---

## 🆘 Still Having Issues?

### Step 1: Check Documentation
- TEXTSHARE_QUICKREF.md - Common issues
- TextShare_SETUP.md - Troubleshooting section
- TEXTSHARE_CHECKLIST.md - Implementation checklist

### Step 2: Review Code Comments
- Each service file has detailed comments
- TextShare.jsx has UI logic explanations
- textShareEncryption.js explains crypto

### Step 3: Verify Installation
```bash
# Check all files exist
ls src/components/TextShare.jsx
ls src/components/TextShare.css
ls src/services/textShare*.js
ls src/config/appSettings.json

# Check dependencies
npm list tweetnacl tweetnacl-util docx qrcode
```

### Step 4: Test Individually
```javascript
// Test each service separately
TextShareEncryption.generatePin()
TextShareStorage.getStatistics()
QRCodeService.getCurrentDomain()
```

---

## 📞 Support Resources

| Issue Type | Resource |
|------------|----------|
| Installation | TEXTSHARE_QUICKREF.md |
| Configuration | appSettings.json |
| API | TextShare_SETUP.md |
| Architecture | TEXTSHARE_ARCHITECTURE.md |
| Testing | TEXTSHARE_CHECKLIST.md |
| Security | TextShare_SETUP.md |

---

**For additional help, review the specific service file related to your issue!** 🚀
