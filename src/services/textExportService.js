// Export utility for TXT, RTF, and DOCX formats
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

class TextExportService {
  // Export as plain text
  static exportAsText(content, filename = 'message.txt') {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      this.downloadFile(blob, filename);
      return true;
    } catch (error) {
      console.error('Text export error:', error);
      throw new Error('Failed to export as TXT');
    }
  }

  // Export as RTF (Rich Text Format)
  static exportAsRTF(content, filename = 'message.rtf') {
    try {
      // Escape special RTF characters
      const escaped = this.escapeRTF(content);
      
      // Basic RTF structure
      const rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033
{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}
{\\*\\generator Msftedit 5.41.21.2510;}\\'d0\\\'d0\\margr720\\margb720\\margt720
\\margl720\\margr720\\pard\\plain\\f0\\fs20
${escaped}
}`;
      
      const blob = new Blob([rtf], { type: 'application/rtf' });
      this.downloadFile(blob, filename);
      return true;
    } catch (error) {
      console.error('RTF export error:', error);
      throw new Error('Failed to export as RTF');
    }
  }

  // Export as DOCX (requires docx library)
  static async exportAsDOCX(content, filename = 'message.docx') {
    try {
      // Split content into paragraphs for better formatting
      const paragraphs = content.split('\n').map(text => {
        // Check if line has formatting indicators (simple markdown-like)
        const isBold = text.startsWith('**') && text.endsWith('**');
        const isItalic = text.startsWith('*') && text.endsWith('*');
        
        let cleanText = text;
        let runs = [];

        if (isBold) {
          cleanText = text.replace(/\*\*/g, '');
          runs.push(new TextRun({
            text: cleanText,
            bold: true,
            font: 'Calibri',
            size: 22
          }));
        } else if (isItalic) {
          cleanText = text.replace(/\*/g, '');
          runs.push(new TextRun({
            text: cleanText,
            italics: true,
            font: 'Calibri',
            size: 22
          }));
        } else {
          runs.push(new TextRun({
            text: cleanText || ' ',
            font: 'Calibri',
            size: 22
          }));
        }

        return new Paragraph({
          children: runs,
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, after: 100 }
        });
      });

      // Add header
      const headerParagraph = new Paragraph({
        children: [
          new TextRun({
            text: 'Shared Message',
            bold: true,
            size: 48,
            font: 'Calibri'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      });

      // Add timestamp
      const timestamp = new Paragraph({
        children: [
          new TextRun({
            text: `Exported on ${new Date().toLocaleString()}`,
            italics: true,
            size: 20,
            color: '666666'
          })
        ],
        spacing: { after: 240 }
      });

      const doc = new Document({
        sections: [{
          children: [headerParagraph, timestamp, ...paragraphs]
        }]
      });

      const blob = await Packer.toBlob(doc);
      this.downloadFile(blob, filename);
      return true;
    } catch (error) {
      console.error('DOCX export error:', error);
      throw new Error('Failed to export as DOCX');
    }
  }

  // Copy to clipboard
  static copyToClipboard(content) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(content).then(() => {
          return { success: true, message: 'Copied to clipboard!' };
        }).catch(() => {
          // Fallback for older browsers
          return this.fallbackCopyToClipboard(content);
        });
      } else {
        return this.fallbackCopyToClipboard(content);
      }
    } catch (error) {
      console.error('Copy error:', error);
      return { success: false, message: 'Failed to copy' };
    }
  }

  // Fallback clipboard method
  static fallbackCopyToClipboard(content) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: true, message: 'Copied to clipboard!' };
    } catch (error) {
      return { success: false, message: 'Failed to copy' };
    }
  }

  // Download file helper
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Escape RTF special characters
  static escapeRTF(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\r\n/g, '\\par\r\n')
      .replace(/\n/g, '\\par\r\n')
      .replace(/\t/g, '\\tab ');
  }

  // Generate filename with timestamp
  static generateFilename(extension, baseFormat = 'message') {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${baseFormat}_${timestamp}.${extension}`;
  }
}

export default TextExportService;
