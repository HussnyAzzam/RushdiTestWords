// TextShare QR Code Service
import QRCode from 'qrcode'

class QRCodeService {
  static getCurrentDomain() {
    if (typeof window === 'undefined') return 'http://localhost:3000'
    return window.location.origin
  }

  static generateShareURL(pin) {
    const domain = this.getCurrentDomain()
    return `${domain}?textshare=${pin}`
  }

  static async generateQRCodeCanvas(pin, size = 256) {
    try {
      const url = this.generateShareURL(pin)
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, url, {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      })
      return canvas
    } catch (error) {
      console.error('QR generation error:', error)
      throw new Error('Failed to generate QR code: ' + error.message)
    }
  }

  static downloadQRCode(pin, filename = 'textshare_qr.png') {
    this.generateQRCodeCanvas(pin).then(canvas => {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
    }).catch(error => {
      console.error('QR download error:', error)
      throw error
    })
  }

  static generateShareMessage(pin, includeLink = true) {
    const timestamp = new Date().toLocaleString()
    let message = `📋 Shared Text Message\nPIN Code: ${pin}\nGenerated: ${timestamp}\n\n`
    if (includeLink) {
      message += `Direct Link:\n${this.generateShareURL(pin)}\n\n`
    }
    message += `Instructions:\n1. Copy the PIN code\n2. Visit the link or app\n3. Paste PIN to retrieve message\n4. Message expires in 24-48 hours`
    return message
  }

  static copyDirectLink(pin) {
    return this.generateShareURL(pin)
  }

  static extractPincodeFromURL() {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('textshare')
  }

  static generateEmailLink(pin) {
    const url = this.generateShareURL(pin)
    const subject = 'TextShare - Secure Message'
    const body = `I've shared a secure message with you!\n\nPIN: ${pin}\n\nURL: ${url}`
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  static generateSMSLink(pin) {
    const url = this.generateShareURL(pin)
    const text = `TextShare PIN: ${pin}\n${url}`
    return `sms:?body=${encodeURIComponent(text)}`
  }

  static async shareViaWebAPI(pin) {
    if (!navigator.share) throw new Error('Web Share API not supported')
    await navigator.share({
      title: 'TextShare - Secure Message',
      text: `Secure message PIN: ${pin}`,
      url: this.generateShareURL(pin)
    })
  }
}

export default QRCodeService
