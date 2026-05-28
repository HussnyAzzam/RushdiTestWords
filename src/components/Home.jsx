import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home({ onOpenCategory, onOpenIP, onOpenUnits, onOpenYouTube, onOpenTextShare, onOpenDataConverter, onOpenQRCodeGenerator, onOpenInvoice }) {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pin = params.get('textshare')
    if (pin) {
      window.history.replaceState({}, '', '/')
      navigate('/textshare?textshare=' + encodeURIComponent(pin), { replace: true })
    }
  }, [navigate])

  return (
    <div className="home-container">
      <h1>🛠️ Super Tools</h1>
      <p>Select a tool to begin</p>
      
      <div className="tools-grid">
        <button className="tool-button" onClick={onOpenYouTube}>
          <div className="tool-icon">▶️</div>
          <div className="tool-name">YouTube Player</div>
          <div className="tool-desc">Video with custom looping</div>
        </button>

        <button className="tool-button" onClick={onOpenTextShare}>
          <div className="tool-icon">🔒</div>
          <div className="tool-name">Text Share</div>
          <div className="tool-desc">Secure encrypted messages with PIN codes & QR</div>
        </button>

        <button className="tool-button" onClick={onOpenDataConverter}>
          <div className="tool-icon">🔀</div>
          <div className="tool-name">Data Converter</div>
          <div className="tool-desc">Transform data between JSON, CSV formats instantly</div>
        </button>

        <button className="tool-button" onClick={onOpenQRCodeGenerator}>
          <div className="tool-icon qr-icon">
            <svg viewBox="0 0 100 100" width="60" height="60" fill="currentColor">
              {/* Top-left position marker */}
              <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2"/>
              <rect x="15" y="15" width="20" height="20" fill="currentColor"/>
              
              {/* Top-right position marker */}
              <rect x="60" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2"/>
              <rect x="65" y="15" width="20" height="20" fill="currentColor"/>
              
              {/* Bottom-left position marker */}
              <rect x="10" y="60" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2"/>
              <rect x="15" y="65" width="20" height="20" fill="currentColor"/>
              
              {/* Data pattern (dots) */}
              <circle cx="55" cy="55" r="2" fill="currentColor"/>
              <circle cx="65" cy="55" r="2" fill="currentColor"/>
              <circle cx="75" cy="55" r="2" fill="currentColor"/>
              <circle cx="55" cy="65" r="2" fill="currentColor"/>
              <circle cx="65" cy="65" r="2" fill="currentColor"/>
              <circle cx="75" cy="65" r="2" fill="currentColor"/>
              <circle cx="55" cy="75" r="2" fill="currentColor"/>
              <circle cx="65" cy="75" r="2" fill="currentColor"/>
              <circle cx="75" cy="75" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div className="tool-name">QR Code Generator</div>
          <div className="tool-desc">Free QR codes: URLs, WiFi, contacts, maps & more</div>
        </button>

        <button className="tool-button" onClick={onOpenCategory}>
          <div className="tool-icon">📝</div>
          <div className="tool-name">Text Tools</div>
          <div className="tool-desc">Search words by letters</div>
        </button>

        <button className="tool-button" onClick={onOpenIP}>
          <div className="tool-icon">🌐</div>
          <div className="tool-name">Find IP</div>
          <div className="tool-desc">Get IP information</div>
        </button>

        <button className="tool-button" onClick={onOpenUnits}>
          <div className="tool-icon">↔️</div>
          <div className="tool-name">Unit Converter</div>
          <div className="tool-desc">Convert between measurements instantly & accurately</div>
        </button>

        <button className="tool-button" onClick={onOpenInvoice}>
          <div className="tool-icon">🧾</div>
          <div className="tool-name">Invoice Builder</div>
          <div className="tool-desc">Create professional Hebrew invoices & business reports</div>
        </button>
      </div>
    </div>
  )
}
