// TextShare Export Service
// Handles exporting messages in different formats

import { Document, Packer, Paragraph, TextRun } from 'docx'

class TextExportService {
  static generateFilename(format) {
    const timestamp = new Date().toISOString().slice(0, 10)
    const extensions = { txt: 'txt', rtf: 'rtf', docx: 'docx' }
    return `textshare_${timestamp}.${extensions[format] || format}`
  }

  static exportAsText(content, filename = 'message.txt') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    this.downloadFile(blob, filename)
  }

  static exportAsRTF(content, filename = 'message.rtf') {
    const rtfContent = this.contentToRTF(content)
    const blob = new Blob([rtfContent], { type: 'text/rtf' })
    this.downloadFile(blob, filename)
  }

  static async exportAsDOCX(content, filename = 'message.docx') {
    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              children: [new TextRun(content)]
            })
          ]
        }]
      })

      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
    } catch (error) {
      console.error('DOCX export error:', error)
      throw new Error('Failed to export as DOCX: ' + error.message)
    }
  }

  static async copyToClipboard(content) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content)
        return { success: true, message: 'Copied to clipboard!' }
      } else {
        // Fallback for older browsers
        return this.fallbackCopy(content)
      }
    } catch (error) {
      return this.fallbackCopy(content)
    }
  }

  static fallbackCopy(text) {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-999999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return { success: true, message: 'Copied to clipboard!' }
    } catch (error) {
      return { success: false, message: 'Failed to copy' }
    }
  }

  static downloadFile(blob, filename) {
    if (!blob) {
      throw new Error('No data to download')
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  static contentToRTF(text) {
    const rtf = '{\\rtf1\\ansi\\ansicpg1252\\cocoartf2150\\cuc{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}{\\colortbl;\\red255\\green255\\blue255;}{\\*\\expandedcolortbl;;}\\margl1440\\margr1440\\margtsxn720\\margbxsxn720\\deftab720\\par\\pard\\plain\\f0\\fs24'
    return rtf + '\n' + this.escapeRTF(text) + '\\par}'
  }

  static escapeRTF(text) {
    return text.replace(/[\\{}\n]/g, c => {
      switch (c) {
        case '\\': return '\\\\'
        case '{': return '\\{'
        case '}': return '\\}'
        case '\n': return '\\par\n'
        default: return c
      }
    })
  }
}

export default TextExportService
