// QR Code generation utility for maximum privacy
// QR encodes only the PIN, full link is constructed on recipient's browser

class QRCodeService {
  // Generate dynamic URL based on current domain
  static getCurrentDomain() {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return '';
  }

  // Generate full shareable link (PIN only in QR for privacy)
  static generateShareLink(pincode) {
    const domain = this.getCurrentDomain();
    const encodedPin = encodeURIComponent(pincode);
    return `${domain}?textshare=${encodedPin}`;
  }

  // Generate QR code data (contains only PIN for privacy)
  static generateQRCodeData(pincode) {
    // QR encodes only the PIN to maximize privacy
    // Full link construction happens on recipient's browser
    return pincode;
  }

  // Generate complete share message
  static generateShareMessage(pincode, includeLink = true) {
    const timestamp = new Date().toLocaleString();
    let message = `📋 Shared Text Message\n`;
    message += `PIN Code: ${pincode}\n`;
    message += `Generated: ${timestamp}\n\n`;

    if (includeLink) {
      const link = this.generateShareLink(pincode);
      message += `Direct Link:\n${link}\n\n`;
    }

    message += `Instructions:\n`;
    message += `1. Copy the PIN code\n`;
    message += `2. Visit the link or app\n`;
    message += `3. Paste the PIN to retrieve message\n`;
    message += `4. Message expires in 24-48 hours\n`;

    return message;
  }

  // Parse PIN from URL parameter
  static extractPincodeFromURL() {
    if (typeof window === 'undefined') return null;
    
    const params = new URLSearchParams(window.location.search);
    return params.get('textshare') || null;
  }

  // Generate QR code as canvas/image
  static async generateQRCodeCanvas(pincode, size = 256) {
    // This requires qrcode.js library to be imported
    // Returns a promise that resolves with canvas element
    try {
      if (typeof QRCode === 'undefined') {
        throw new Error('QRCode library not loaded. Include qrcode.js in index.html');
      }

      return new Promise((resolve, reject) => {
        try {
          const qr = new QRCode({
            text: this.generateQRCodeData(pincode),
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H, // High error correction
            useSVG: false
          });

          const canvas = qr._canvas;
          resolve(canvas);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Download QR code as image
  static downloadQRCode(pincode, filename = 'textshare_qr.png') {
    try {
      if (typeof QRCode === 'undefined') {
        throw new Error('QRCode library not loaded');
      }

      const qr = new QRCode({
        text: this.generateQRCodeData(pincode),
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      const canvas = qr._canvas;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'QR code downloaded' };
    } catch (error) {
      console.error('QR download error:', error);
      throw new Error('Failed to download QR code');
    }
  }

  // Generate share data for sharing APIs (Web Share API)
  static async shareViaWebAPI(pincode) {
    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported');
      }

      const link = this.generateShareLink(pincode);
      const message = this.generateShareMessage(pincode, true);

      await navigator.share({
        title: 'Shared Text Message',
        text: message,
        url: link
      });

      return { success: true, message: 'Shared successfully' };
    } catch (error) {
      console.error('Share error:', error);
      throw error;
    }
  }

  // Generate mailto link for email sharing
  static generateEmailLink(pincode) {
    const link = this.generateShareLink(pincode);
    const message = this.generateShareMessage(pincode, true);
    const subject = encodeURIComponent('Shared Text Message');
    const body = encodeURIComponent(message);
    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Generate SMS share link
  static generateSMSLink(pincode) {
    const link = this.generateShareLink(pincode);
    const text = encodeURIComponent(`Check out this shared message: ${link}`);
    return `sms:?body=${text}`;
  }
}

export default QRCodeService;
