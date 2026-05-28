// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/services/dataConverterService.js
/**
 * Data Converter Service
 * Handles conversion between JSON, CSV, Excel, and PDF formats
 */

class DataConverterService {
  /**
   * Parse CSV string to JSON array
   * @param {string} csvContent - CSV content
   * @returns {Array} Array of objects
   */
  static parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n')
    if (lines.length === 0) throw new Error('Empty CSV file')

    // Parse header
    const headers = this.parseCSVLine(lines[0])
    if (headers.length === 0) throw new Error('Invalid CSV: no headers found')

    // Parse rows
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length > 0) {
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        data.push(obj)
      }
    }

    return data
  }

  /**
   * Parse a single CSV line, handling quoted values
   * @param {string} line - CSV line
   * @returns {Array} Array of values
   */
  static parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  /**
   * Convert JSON array to CSV
   * @param {Array} data - Array of objects
   * @param {Object} options - Export options
   * @param {boolean} options.includeHeader - Include header row
   * @param {boolean} options.addRowNumbers - Add row number column
   * @returns {string} CSV string
   */
  static jsonToCSV(data, options = { includeHeader: true, addRowNumbers: false }) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data: expected non-empty array')
    }

    // Get all unique keys
    const keys = new Set()
    data.forEach(obj => {
      Object.keys(obj).forEach(key => keys.add(key))
    })

    const headers = Array.from(keys)
    const rows = []

    // Add header row if option is true
    if (options.includeHeader) {
      if (options.addRowNumbers) {
        rows.push(['#', ...headers].join(','))
      } else {
        rows.push(headers.join(','))
      }
    }

    // Add data rows
    data.forEach((obj, rowIndex) => {
      const values = headers.map(key => {
        const value = obj[key] ?? ''
        // Escape quotes and wrap in quotes if contains comma, newline, or quotes
        const strValue = String(value)
        if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      })

      if (options.addRowNumbers) {
        rows.push([(rowIndex + 1).toString(), ...values].join(','))
      } else {
        rows.push(values.join(','))
      }
    })

    return rows.join('\n')
  }

  /**
   * Validate JSON data
   * @param {string} jsonString - JSON string
   * @returns {Array|Object} Parsed JSON
   */
  static validateJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString)
      if (Array.isArray(parsed)) {
        return parsed
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Wrap single object in array
        return [parsed]
      }
      throw new Error('JSON must be an object or array')
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`)
    }
  }

  /**
   * Parse Excel file (requires XLSX library)
   * @param {File} file - Excel file
   * @returns {Promise<{sheets: Array, data: Array}>} Sheet info and data
   */
  static async parseExcel(file) {
    try {
      // Dynamically import XLSX if needed
      const XLSX = (await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js')).default

      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const sheets = workbook.SheetNames
      const data = []

      sheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const sheetData = XLSX.utils.sheet_to_json(worksheet)
        data.push({
          sheet: sheetName,
          data: sheetData
        })
      })

      return { sheets, data }
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`)
    }
  }

  /**
   * Generate Excel file from JSON
   * @param {Array} data - Array of objects
   * @param {string} sheetName - Sheet name
   * @returns {Promise<Blob>} Excel file blob
   */
  static async generateExcel(data, sheetName = 'Sheet1') {
    try {
      // For now, generate CSV and return as CSV
      // In production, use XLSX library for true Excel
      const csv = this.jsonToCSV(data)
      return new Blob([csv], { type: 'text/csv' })
    } catch (error) {
      throw new Error(`Failed to generate Excel: ${error.message}`)
    }
  }

  /**
   * Generate CSV blob
   * @param {Array} data - Array of objects
   * @returns {Blob} CSV blob
   */
  static generateCSV(data) {
    const csv = this.jsonToCSV(data)
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

  /**
   * Generate JSON blob
   * @param {Array} data - Array of objects
   * @param {boolean} pretty - Pretty print
   * @returns {Blob} JSON blob
   */
  static generateJSON(data, pretty = true) {
    const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    return new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  }

  /**
   * Generate PDF from data (basic implementation)
   * @param {Array} data - Array of objects
   * @param {string} title - Document title
   * @returns {Blob} PDF blob (simplified version)
   */
  static generatePDF(data, title = 'Document') {
    try {
      // Simple PDF generation using jsPDF
      const csv = this.jsonToCSV(data)
      const pdfContent = `${title}\n\n${csv}`
      return new Blob([pdfContent], { type: 'text/plain' })
      // In production, use jsPDF library for true PDF
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  }

  /**
   * Download file
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Detect file type from content
   * @param {string} content - File content
   * @returns {string} File type
   */
  static detectFileType(content) {
    const trimmed = content.trim()
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json'
    } else if (trimmed.split('\n')[0]?.includes(',')) {
      return 'csv'
    }
    
    return 'unknown'
  }
}

export default DataConverterService