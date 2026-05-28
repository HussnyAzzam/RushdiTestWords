// filepath: /Users/mediaplus/Desktop/Apps/Super-Tools-App/src/components/DataConverter.jsx
import React, { useState } from 'react'
import DataConverterService from '../services/dataConverterService'
import './DataConverter.css'

export default function DataConverter({ onBack }) {
  const [inputData, setInputData] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [inputFormat, setInputFormat] = useState('json')
  const [outputFormat, setOutputFormat] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sheets, setSheets] = useState([])
  const [selectedSheet, setSelectedSheet] = useState(0)
  const [addRowNumbers, setAddRowNumbers] = useState(false)
  const [includeHeader, setIncludeHeader] = useState(true)

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleFileUpload = async (e) => {
    clearMessages()
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const content = await file.text()
      setInputData(content)
      
      // Auto-detect format
      const detected = DataConverterService.detectFileType(content)
      if (detected !== 'unknown') {
        setInputFormat(detected)
      }

      setSuccess(`File uploaded: ${file.name}`)
    } catch (err) {
      setError(`Failed to read file: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleParseInput = async () => {
    clearMessages()
    if (!inputData.trim()) {
      setError('Please enter data')
      return
    }

    setLoading(true)
    try {
      let data

      if (inputFormat === 'json') {
        data = DataConverterService.validateJSON(inputData)
      } else if (inputFormat === 'csv') {
        data = DataConverterService.parseCSV(inputData)
      }

      if (!Array.isArray(data)) {
        data = [data]
      }

      setParsedData(data)
      setSuccess(`Successfully parsed ${data.length} records`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    clearMessages()
    if (!parsedData) {
      setError('No data to convert')
      return
    }

    try {
      const timestamp = new Date().toISOString().slice(0, 10)
      let blob, filename

      if (outputFormat === 'csv') {
        const csv = DataConverterService.jsonToCSV(parsedData, { 
          includeHeader, 
          addRowNumbers 
        })
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        filename = `data_${timestamp}.csv`
      } else if (outputFormat === 'json') {
        blob = DataConverterService.generateJSON(parsedData, true)
        filename = `data_${timestamp}.json`
      }

      DataConverterService.downloadFile(blob, filename)
      setSuccess(`Downloaded ${filename}`)
    } catch (err) {
      setError(`Conversion failed: ${err.message}`)
    }
  }

  const handlePrint = () => {
    clearMessages()
    if (!parsedData) {
      setError('No data to print')
      return
    }

    try {
      const printWindow = window.open('', '', 'width=800,height=600')
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Data Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #667eea; color: white; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Data Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(parsedData[0] || {})
                    .map(key => `<th>${key}</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${parsedData
                  .map(row => `
                    <tr>
                      ${Object.values(row)
                        .map(val => `<td>${val}</td>`)
                        .join('')}
                    </tr>
                  `)
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
      setSuccess('Print dialog opened')
    } catch (err) {
      setError(`Print failed: ${err.message}`)
    }
  }

  return (
    <div className="data-converter">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="converter-container">
        <h2>📊 Data Converter</h2>
        <p>Convert between JSON, CSV, and Excel formats</p>

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

        <div className="converter-section">
          <h3>📥 Input Data</h3>

          <div className="input-options">
            <div className="form-group">
              <label>Format:</label>
              <select 
                value={inputFormat} 
                onChange={(e) => setInputFormat(e.target.value)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload File:</label>
              <input 
                type="file" 
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="input-textarea">Paste Data:</label>
            <textarea
              id="input-textarea"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={inputFormat === 'json' 
                ? '{\n  "name": "John",\n  "age": 30\n}'
                : 'name,age,email\nJohn,30,john@example.com'
              }
              rows="8"
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleParseInput}
            disabled={!inputData.trim() || loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ Processing...' : '▶️ Parse Data'}
          </button>
        </div>

        {parsedData && (
          <>
            <div className="converter-section">
              <h3>👁️ Preview</h3>
              
              <div className="preview-info">
                <p><strong>Records:</strong> {parsedData.length}</p>
                {parsedData[0] && (
                  <p><strong>Fields:</strong> {Object.keys(parsedData[0]).length}</p>
                )}
              </div>

              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      {parsedData[0] && Object.keys(parsedData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i}>{String(val).substring(0, 50)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="preview-info">... and {parsedData.length - 5} more rows</p>
                )}
              </div>
            </div>

            <div className="converter-section">
              <h3>📤 Output</h3>

              <div className="form-group">
                <label>Export Format:</label>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="form-group">
                <label>Export Options:</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={includeHeader}
                      onChange={(e) => setIncludeHeader(e.target.checked)}
                    />
                    Include Header Row
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={addRowNumbers}
                      onChange={(e) => setAddRowNumbers(e.target.checked)}
                    />
                    Add Row Numbers
                  </label>
                </div>
              </div>

              <div className="button-group">
                <button 
                  onClick={handleConvert}
                  className="btn btn-primary"
                >
                  ⬇️ Download {outputFormat.toUpperCase()}
                </button>

                <button 
                  onClick={handlePrint}
                  className="btn btn-secondary"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            <div className="converter-section">
              <h3>📋 JSON Preview</h3>
              <pre className="json-preview">
                {JSON.stringify(parsedData.slice(0, 2), null, 2)}
                {parsedData.length > 2 && '\n... more data ...'}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}